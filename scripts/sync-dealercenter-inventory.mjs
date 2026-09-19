#!/usr/bin/env node
/**
 * DealerCenter (NOWCOM) inventory feed → INVENTORY_FILE_PATH (read live by the site when
 * INVENTORY_SOURCE=file — see src/lib/inventory/repository.ts). Meant to run on a schedule (cron)
 * on the VPS, watching the SFTP-only `dcimport` account's upload folder for a file DealerCenter
 * drops there.
 *
 *   node scripts/sync-dealercenter-inventory.mjs [uploadDir] [outFile]
 *   uploadDir defaults to DC_INVENTORY_UPLOAD_DIR or /home/dcimport/upload
 *   outFile   defaults to INVENTORY_FILE_PATH or .data/dealercenter-inventory.json
 *
 * NOWCOM Inventory Standards (from DealerCenter support, 2026-09):
 *   File type: .TXT or .CSV, single file, header row included, text qualifier not required.
 *   Columns: AccountID*, DCID, DealerName, Address, City, State, Zip, Phone, StockNumber*, VIN,
 *   Year, Make, Model, Trim, Odometer, SpecialPrice, ExteriorColor, InteriorColor, Transmission,
 *   PhotoURLs, WebAdDescription, EquipmentCode, LatestPhotoModifiedDate.  (* = required by them —
 *   note VIN/Year/Make/Model are NOT required on their end, but a row missing any of those can't
 *   become a usable listing here, so such rows are skipped, not defaulted.)
 *
 * The field spec doesn't state a delivery-time delimiter unambiguously (it says .csv is
 * pipe-delimited and .txt is comma-delimited, the reverse of the usual convention), so this
 * detects the delimiter from the header row itself rather than trusting the file extension.
 * Same for the PhotoURLs/EquipmentCode sub-lists: whichever of "|" or "," actually appears in the
 * value is used as its separator.
 *
 * No vehicle-status column exists in this feed, so (like `inventory:import`) any vehicle present
 * in the previous synced output but missing from the new file is marked "sold" rather than
 * deleted outright — DealerCenter simply lists what's currently in stock.
 */
import fs from "node:fs";
import path from "node:path";

const uploadDir = process.argv[2] || process.env.DC_INVENTORY_UPLOAD_DIR || "/home/dcimport/upload";
const outFile = path.resolve(process.argv[3] || process.env.INVENTORY_FILE_PATH || ".data/dealercenter-inventory.json");

/**
 * Manual "treat as sold" list for vehicles DealerCenter's feed hasn't caught up on yet — the feed
 * has no status/sold column at all, so we can only infer "sold" when a stock number disappears
 * from the file entirely (see below). Add a stock number here if it's actually sold but still
 * appearing in their export; remove it once DealerCenter's feed stops including it on its own.
 */
const forceSoldPath = path.resolve("data/dealercenter-force-sold.json");
const forceSold = new Set(fs.existsSync(forceSoldPath) ? JSON.parse(fs.readFileSync(forceSoldPath, "utf8")).map((s) => String(s).toUpperCase()) : []);

/**
 * Full removal list — for a vehicle that shouldn't appear on the site at all (not even as "Sold"),
 * regardless of what DealerCenter's feed says. Distinct from forceSold above, which still shows
 * the vehicle with a Sold badge.
 */
const excludePath = path.resolve("data/dealercenter-exclude.json");
const excludeStock = new Set(fs.existsSync(excludePath) ? JSON.parse(fs.readFileSync(excludePath, "utf8")).map((s) => String(s).toUpperCase()) : []);

function findLatestFile(dir) {
  if (!fs.existsSync(dir)) return null;
  const candidates = fs
    .readdirSync(dir)
    .filter((f) => /\.(csv|txt)$/i.test(f))
    .map((f) => {
      const full = path.join(dir, f);
      return { full, mtime: fs.statSync(full).mtimeMs };
    })
    .sort((a, b) => b.mtime - a.mtime);
  return candidates[0]?.full ?? null;
}

function detectDelimiter(headerLine) {
  const pipes = (headerLine.match(/\|/g) ?? []).length;
  const commas = (headerLine.match(/,/g) ?? []).length;
  return pipes > commas ? "|" : ",";
}

function parseDelimited(text, delim) {
  const rows = [];
  let row = [], cell = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === delim) { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const [head, ...body] = rows.filter((r) => r.some((x) => x.trim()));
  const keys = head.map((h) => h.trim().toLowerCase().replace(/[^a-z0-9]/g, ""));
  return body.map((r) => Object.fromEntries(keys.map((k, i) => [k, (r[i] ?? "").trim()])));
}

const splitList = (s) => {
  if (!s) return [];
  const delim = s.includes("|") ? "|" : ",";
  return s.split(delim).map((x) => x.trim()).filter(Boolean);
};
const numOrNull = (s) => (s === undefined || s === null || s === "" ? null : Number(String(s).replace(/[^\d.]/g, "")) || null);
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function fromRow(r) {
  const year = Number(r.year);
  const make = String(r.make ?? "").trim();
  const model = String(r.model ?? "").trim();
  const stock = String(r.stocknumber ?? "").trim();
  const trim = r.trim || null;
  const photos = splitList(r.photourls);
  const name = [year, make, model, trim].filter(Boolean).join(" ");
  return {
    id: stock.toLowerCase(),
    slug: slugify(`${year}-${make}-${model}-${stock}`),
    status: "available",
    condition: "used",
    year,
    make,
    model,
    trim,
    bodyStyle: null,
    price: numOrNull(r.price ?? r.specialprice ?? r.askingprice),
    salePrice: null,
    mileage: Number(String(r.odometer ?? "0").replace(/[^\d]/g, "")),
    vin: String(r.vin ?? "").trim().toUpperCase(),
    stockNumber: stock,
    exteriorColor: r.exteriorcolor || null,
    interiorColor: r.interiorcolor || null,
    transmission: r.transmission || null,
    drivetrain: r.drivetrain || null,
    fuelType: r.fueltype || null,
    engine: r.engine || null,
    description: r.webaddescription || null,
    // The feed's equipmentCode column has turned out to be a generic reference list, not
    // as-equipped options (e.g. it lists "Winch"/"3rd Row Seating" on a Hyundai Sonata sedan) —
    // reported to DealerCenter 2026-09-16. Not trusted for display until they fix it on their end.
    features: [],
    photos: photos.map((p, i) => ({ url: p, alt: `${name}, photo ${i + 1} of ${photos.length}` })),
    dateAdded: new Date().toISOString().slice(0, 10),
  };
}

function validate(v) {
  const e = [];
  if (!v.stockNumber) e.push("missing stock number");
  if (!/^[A-HJ-NPR-Z0-9]{11,17}$/.test(v.vin)) e.push("missing/invalid VIN");
  if (!(v.year >= 1950 && v.year <= new Date().getFullYear() + 2)) e.push("missing/invalid year");
  if (!v.make || !v.model) e.push("missing make/model");
  if (!Number.isFinite(v.mileage)) e.push("invalid mileage");
  return e;
}

const file = findLatestFile(uploadDir);
if (!file) {
  console.log(`[dealercenter-sync] no .csv/.txt file found in ${uploadDir} — nothing to do.`);
  process.exit(0);
}

const raw = fs.readFileSync(file, "utf8");
const firstLine = raw.split(/\r?\n/, 1)[0] ?? "";
const delim = detectDelimiter(firstLine);
const rows = parseDelimited(raw, delim);

const vehicles = [], errors = [];
for (const [i, r] of rows.entries()) {
  const v = fromRow(r);
  const e = validate(v);
  if (e.length) errors.push(`Row ${i + 2} (stock ${v.stockNumber || "?"}): ${e.join(", ")}`);
  else if (!excludeStock.has(v.stockNumber.toUpperCase())) {
    if (forceSold.has(v.stockNumber.toUpperCase())) v.status = "sold";
    vehicles.push(v);
  }
}

if (!vehicles.length) {
  console.error(`[dealercenter-sync] ${file}: no valid vehicles parsed (${delim === "|" ? "pipe" : "comma"}-delimited, ${rows.length} row(s)). ${outFile} was not changed.`);
  if (errors.length) console.error(errors.join("\n"));
  process.exit(1);
}

const previous = fs.existsSync(outFile) ? JSON.parse(fs.readFileSync(outFile, "utf8")) : { vehicles: [] };
const previousByStock = new Map((previous.vehicles ?? []).map((v) => [v.stockNumber, v]));

// The feed carries no "listed on" date, so every sync would otherwise stamp today and every
// vehicle would look brand new. Keep the earliest date we've ever seen this stock number.
for (const v of vehicles) {
  const before = previousByStock.get(v.stockNumber);
  if (before?.dateAdded && before.dateAdded < v.dateAdded) v.dateAdded = before.dateAdded;
}

const seen = new Set(vehicles.map((v) => v.stockNumber));
// Treat excluded stock numbers as accounted-for so the "went missing → mark sold" fallback below
// doesn't resurrect a fully-removed vehicle from an older synced copy.
for (const s of excludeStock) seen.add(s);
let unpublished = 0;
for (const old of previous.vehicles ?? []) {
  if (seen.has(old.stockNumber)) continue;
  // Carry sold vehicles forward instead of dropping them. Only checking `status !== "sold"` here
  // meant a vehicle showed as Sold for a single sync and then vanished from the site and the CRM
  // entirely, taking its performance history with it.
  if (old.status !== "sold") unpublished++;
  vehicles.push({ ...old, status: "sold" });
}

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(
  outFile,
  JSON.stringify({ meta: { source: `DealerCenter feed (${path.basename(file)})`, capturedAt: new Date().toISOString(), verified: true, notes: [] }, vehicles }, null, 2) + "\n",
);

console.log(
  `[dealercenter-sync] ${new Date().toISOString()}: imported ${vehicles.length - unpublished} vehicle(s) from ${path.basename(file)}` +
    (unpublished ? `, marked ${unpublished} missing vehicle(s) as sold` : "") +
    (errors.length ? `, skipped ${errors.length} invalid row(s)` : ""),
);
if (errors.length) console.log(errors.join("\n"));
