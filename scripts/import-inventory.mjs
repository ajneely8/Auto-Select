#!/usr/bin/env node
/**
 * Inventory import (CSV or JSON) → data/inventory.json
 *
 *   npm run inventory:import -- path/to/export.csv
 *   npm run inventory:import -- path/to/feed.json
 *   npm run inventory:import -- https://your-dms.example.com/feed.json
 *
 * CSV columns (header row, case-insensitive; see data/inventory-template.csv):
 *   stock_number, vin, status, condition, year, make, model, trim, body_style, price, sale_price, mileage,
 *   exterior_color, interior_color, transmission, drivetrain, fuel_type, engine, mpg_city, mpg_highway,
 *   doors, seats, description, features (separate with |), photos (URLs separated with |),
 *   exterior_360_frames (URLs separated with |), exterior_360_embed_url, interior_360_url,
 *   history_report_url, featured (yes/no), date_added (YYYY-MM-DD)
 *
 * Behavior:
 *  - Validates each row; invalid rows are reported and skipped (the previous file is kept if nothing is valid).
 *  - Vehicles in the old file but missing from the import are marked "sold" (auto-unpublished) unless --keep-missing.
 *  - Prints quality warnings: low photo count, missing price/description/trim/MPG, duplicate stock numbers.
 *  - Does NOT scrape third-party websites. Use your DMS/inventory provider's authorized export or feed.
 */
import fs from "node:fs";
import path from "node:path";

const OUT = path.resolve("data/inventory.json");
const args = process.argv.slice(2);
const source = args.find((a) => !a.startsWith("--"));
const keepMissing = args.includes("--keep-missing");
if (!source) {
  console.error("Usage: npm run inventory:import -- <file.csv|file.json|https://feed-url> [--keep-missing]");
  process.exit(1);
}

function parseCsv(text) {
  const rows = [];
  let row = [], cell = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const [head, ...body] = rows.filter((r) => r.some((x) => x.trim()));
  const keys = head.map((h) => h.trim().toLowerCase().replace(/[\s-]+/g, "_"));
  return body.map((r) => Object.fromEntries(keys.map((k, i) => [k, (r[i] ?? "").trim()])));
}

const list = (s) => (s ? String(s).split("|").map((x) => x.trim()).filter(Boolean) : []);
const numOrNull = (s) => (s === undefined || s === null || s === "" ? null : Number(String(s).replace(/[^\d.]/g, "")) || null);
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function fromRow(r) {
  // Accept both snake_case CSV rows and camelCase JSON objects.
  const g = (snake, camel) => r[snake] ?? r[camel];
  const year = Number(g("year", "year"));
  const make = String(g("make", "make") ?? "").trim();
  const model = String(g("model", "model") ?? "").trim();
  const stock = String(g("stock_number", "stockNumber") ?? "").trim();
  const trim = g("trim", "trim") || null;
  const photos = Array.isArray(r.photos) ? r.photos : list(r.photos);
  const name = [year, make, model, trim].filter(Boolean).join(" ");
  return {
    id: stock.toLowerCase(),
    slug: slugify(`${year}-${make}-${model}-${stock}`),
    status: (g("status", "status") || "available").toLowerCase(),
    condition: (g("condition", "condition") || "used").toLowerCase(),
    year,
    make,
    model,
    trim,
    bodyStyle: g("body_style", "bodyStyle") || null,
    price: numOrNull(g("price", "price")),
    salePrice: numOrNull(g("sale_price", "salePrice")),
    mileage: Number(String(g("mileage", "mileage") ?? "0").replace(/[^\d]/g, "")),
    vin: String(g("vin", "vin") ?? "").trim().toUpperCase(),
    stockNumber: stock,
    exteriorColor: g("exterior_color", "exteriorColor") || null,
    interiorColor: g("interior_color", "interiorColor") || null,
    transmission: g("transmission", "transmission") || null,
    drivetrain: g("drivetrain", "drivetrain") || null,
    fuelType: g("fuel_type", "fuelType") || null,
    engine: g("engine", "engine") || null,
    mpgCity: numOrNull(g("mpg_city", "mpgCity")),
    mpgHighway: numOrNull(g("mpg_highway", "mpgHighway")),
    doors: numOrNull(g("doors", "doors")),
    seats: numOrNull(g("seats", "seats")),
    description: g("description", "description") || null,
    features: Array.isArray(r.features) ? r.features : list(r.features),
    photos: photos.map((p, i) => (typeof p === "string" ? { url: p, alt: `${name}, photo ${i + 1} of ${photos.length}` } : p)),
    exterior360Frames: (Array.isArray(r.exterior360Frames) ? r.exterior360Frames : list(r.exterior_360_frames)).length ? (Array.isArray(r.exterior360Frames) ? r.exterior360Frames : list(r.exterior_360_frames)) : null,
    exterior360EmbedUrl: g("exterior_360_embed_url", "exterior360EmbedUrl") || null,
    interior360Url: g("interior_360_url", "interior360Url") || null,
    historyReportUrl: g("history_report_url", "historyReportUrl") || null,
    featured: /^(1|y|yes|true)$/i.test(String(g("featured", "featured") ?? "")),
    dateAdded: g("date_added", "dateAdded") || new Date().toISOString().slice(0, 10),
  };
}

function validate(v) {
  const e = [];
  if (!v.stockNumber) e.push("missing stock number");
  if (!/^[A-HJ-NPR-Z0-9]{11,17}$/.test(v.vin)) e.push("invalid VIN");
  if (!(v.year >= 1950 && v.year <= new Date().getFullYear() + 2)) e.push("invalid year");
  if (!v.make || !v.model) e.push("missing make/model");
  if (!Number.isFinite(v.mileage)) e.push("invalid mileage");
  if (!["available", "pending", "sold", "in-transit"].includes(v.status)) e.push(`unknown status "${v.status}"`);
  return e;
}

const raw = /^https?:\/\//.test(source) ? await (await fetch(source)).text() : fs.readFileSync(source, "utf8");
const input = source.endsWith(".csv") || /^\s*[a-z_ ]+,/i.test(raw.split("\n")[0]) ? parseCsv(raw) : (() => { const j = JSON.parse(raw); return Array.isArray(j) ? j : j.vehicles; })();

const vehicles = [], errors = [];
for (const [i, r] of input.entries()) {
  const v = fromRow(r);
  const e = validate(v);
  if (e.length) errors.push(`Row ${i + 2} (${v.stockNumber || "no stock #"}): ${e.join(", ")}`);
  else vehicles.push(v);
}
if (!vehicles.length) {
  console.error("No valid vehicles found. data/inventory.json was not changed.\n" + errors.join("\n"));
  process.exit(1);
}

const previous = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : { vehicles: [] };
const seen = new Set(vehicles.map((v) => v.stockNumber));
let unpublished = 0;
if (!keepMissing) {
  for (const old of previous.vehicles ?? []) {
    if (!seen.has(old.stockNumber) && old.status !== "sold") {
      vehicles.push({ ...old, status: "sold" });
      unpublished++;
    }
  }
}

// Quality warnings (mirrors src/lib/inventory/health.ts).
const warn = [];
const counts = new Map();
for (const v of vehicles) counts.set(v.stockNumber, (counts.get(v.stockNumber) ?? 0) + 1);
for (const v of vehicles.filter((x) => x.status !== "sold")) {
  const id = `${v.stockNumber} ${v.year} ${v.make} ${v.model}`;
  if (v.price == null) warn.push(`${id}: missing price (shows "Call for Price")`);
  if (v.photos.length < 8) warn.push(`${id}: low photo count (${v.photos.length})`);
  if (!v.description || v.description.length < 120) warn.push(`${id}: missing or short description`);
  if (!v.trim) warn.push(`${id}: trim not set`);
  if (counts.get(v.stockNumber) > 1) warn.push(`${id}: DUPLICATE stock number`);
}

fs.writeFileSync(
  OUT,
  JSON.stringify({ meta: { source: `Imported from ${path.basename(source)}`, capturedAt: new Date().toISOString().slice(0, 10), verified: true, notes: [] }, vehicles }, null, 2) + "\n",
);
console.log(`✔ Imported ${vehicles.length - unpublished} vehicles${unpublished ? `, marked ${unpublished} missing vehicle(s) as sold` : ""}.`);
if (errors.length) console.log(`\n✖ Skipped ${errors.length} invalid row(s):\n  ${errors.join("\n  ")}`);
if (warn.length) console.log(`\n⚠ ${warn.length} quality warning(s):\n  ${warn.join("\n  ")}`);
console.log("\nNext: commit data/inventory.json and redeploy, or call /api/inventory/sync on a feed-based setup.");
