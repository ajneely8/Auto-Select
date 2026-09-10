#!/usr/bin/env node
/** Prints inventory quality warnings for data/inventory.json.  npm run inventory:check */
import fs from "node:fs";

const { meta, vehicles } = JSON.parse(fs.readFileSync("data/inventory.json", "utf8"));
const live = vehicles.filter((v) => v.status !== "sold");
const counts = new Map();
for (const v of vehicles) counts.set(v.stockNumber, (counts.get(v.stockNumber) ?? 0) + 1);

console.log(`Source: ${meta?.source ?? "unknown"} (${meta?.capturedAt ?? "?"})${meta?.verified === false ? "  ⚠ NOT VERIFIED" : ""}`);
console.log(`${live.length} published · ${vehicles.length - live.length} sold/unpublished · ${vehicles.filter((v) => v.featured).length} featured\n`);

let n = 0;
for (const v of live) {
  const issues = [];
  if (v.price == null) issues.push("missing price");
  if (!v.photos?.length) issues.push("NO PHOTOS");
  else if (v.photos.length < 8) issues.push(`low photo count (${v.photos.length})`);
  if (!v.description || v.description.length < 120) issues.push("missing/short description");
  if (!v.trim) issues.push("no trim");
  if (!v.features?.length) issues.push("no features listed");
  if (v.mpgCity == null || v.mpgHighway == null) issues.push("no MPG");
  if (counts.get(v.stockNumber) > 1) issues.push("DUPLICATE stock number");
  if (v.exterior360Frames && ![36, 48, 72].includes(v.exterior360Frames.length)) issues.push(`360 has ${v.exterior360Frames.length} frames (use 36/48/72)`);
  if (v.exterior360IsDemo) issues.push("uses DEMO 360 sequence");
  if (issues.length) {
    n += issues.length;
    console.log(`• ${v.stockNumber}  ${v.year} ${v.make} ${v.model}\n    ${issues.join(" · ")}`);
    for (const note of v.internalNotes ?? []) console.log(`    note: ${note}`);
  }
}
console.log(n ? `\n${n} issue(s) found.` : "\nNo issues found.");
