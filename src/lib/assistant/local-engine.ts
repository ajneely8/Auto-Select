import "server-only";
import type { Vehicle } from "@/lib/types";
import { business } from "@/config/business";
import { getPublishedVehicles } from "@/lib/inventory/repository";
import { displayPrice, formatPrice, formatNumber, vehicleFullName } from "@/lib/format";
import { searchInventory, findVehicle, estimatePayment, type SearchArgs } from "./tools";

/**
 * Rules-based fallback used when no ANTHROPIC_API_KEY is configured (or the API is unavailable).
 * Handles the most common inventory questions deterministically from the same listing data,
 * so the widget is useful from day one. It never invents facts: anything not in the data is
 * referred to the team.
 */

const hours = business.hoursSummary.map((h) => `${h.label}: ${h.value}`).join(" · ");
const confirmLine = "Availability and details are confirmed by our team — use **Check Availability** on the vehicle page or call " + business.phone.display + ".";

const has = (q: string, ...words: (string | RegExp)[]) => words.some((w) => (typeof w === "string" ? q.includes(w) : w.test(q)));
const num = (s: string, k?: string) => Math.round(Number(s.replace(/,/g, "")) * (k ? 1000 : 1));

function line(v: Vehicle) {
  return `- [${vehicleFullName(v)}](/inventory/${v.slug}) — ${formatPrice(displayPrice(v))} · ${formatNumber(v.mileage)} mi${v.drivetrain ? ` · ${v.drivetrain}` : ""}`;
}

function vehicleAnswer(v: Vehicle, q: string): string {
  const name = `[${vehicleFullName(v)}](/inventory/${v.slug})`;
  const parts: string[] = [];
  if (has(q, "mile", "odometer")) parts.push(`It shows **${formatNumber(v.mileage)} miles**.`);
  if (has(q, "price", "cost", "how much", "cuánto", "cuanto")) parts.push(`The listed price is **${formatPrice(displayPrice(v))}** (plus tax, title, license, and dealer fees).`);
  if (has(q, "color", "colour")) parts.push(`It's ${v.exteriorColor?.toLowerCase() ?? "a color we'll confirm"} outside${v.interiorColor ? ` with a ${v.interiorColor.toLowerCase()} interior` : ""}.`);
  if (has(q, "4x4", "4wd", "awd", "all wheel", "all-wheel", "four wheel", "drivetrain", "fwd", "rwd", "2wd"))
    parts.push(v.drivetrain ? `The listing shows **${v.drivetrain}**.` : "The drivetrain isn't listed yet — our team can confirm it.");
  if (has(q, "engine", "motor", "cylinder", "v6", "v8")) parts.push(v.engine ? `It has a ${v.engine} engine.` : "The engine isn't listed yet.");
  if (has(q, "transmission", "automatic", "manual")) parts.push(v.transmission ? `Transmission: ${v.transmission}.` : "The transmission isn't listed yet.");
  if (has(q, "mpg", "gas mileage", "fuel economy")) parts.push(v.mpgCity && v.mpgHighway ? `EPA estimates: ${v.mpgCity} city / ${v.mpgHighway} highway.` : "Fuel-economy figures aren't posted for this vehicle yet.");
  if (has(q, "seat", "third row", "3rd row", "passenger")) parts.push(v.seats ? `It seats ${v.seats}.` : v.features.some((f) => /third-row/i.test(f)) ? "It has third-row seating." : "Seating capacity isn't listed yet.");
  if (has(q, "feature", "option", "equipment", "sunroof", "leather", "navigation", "camera", "carplay", "bluetooth", "heated"))
    parts.push(v.features.length ? `Listed features: ${v.features.join(", ")}. For anything not listed, we'll confirm with you.` : "A full equipment list isn't posted yet — ask us and we'll confirm specific features.");
  if (has(q, "accident", "history", "carfax", "autocheck", "owner", "title", "clean"))
    parts.push(v.historyReportUrl ? "A vehicle history report link is on the vehicle page." : "A history report isn't posted for this vehicle. Our team can answer history and title questions directly.");
  if (has(q, "available", "still", "sold", "disponible")) parts.push(`It's listed as ${v.status === "available" ? "available" : v.status} on our website.`);
  if (has(q, "payment", "monthly", "per month", "a month")) {
    const p = displayPrice(v);
    if (p) {
      const e = estimatePayment({ price: p, down_payment: Math.round(p * 0.1), term_months: 72 });
      parts.push(`With 10% down over 72 months at an example ${e.assumptions.apr_percent}% APR, that's roughly **$${formatNumber(e.estimated_monthly_payment_usd)}/mo** — an estimate only, not an offer of credit.`);
    }
  }
  if (!parts.length) {
    parts.push(
      `${vehicleFullName(v)}: ${formatPrice(displayPrice(v))}, ${formatNumber(v.mileage)} miles${v.exteriorColor ? `, ${v.exteriorColor.toLowerCase()}` : ""}${v.drivetrain ? `, ${v.drivetrain}` : ""}${v.engine ? `, ${v.engine}` : ""}${v.transmission ? `, ${v.transmission.toLowerCase()}` : ""}. Stock ${v.stockNumber}.`,
    );
  }
  return `${name}: ${parts.join(" ")}\n\n${confirmLine}`;
}

export async function answerLocally(question: string, pageVehicle: Vehicle | null): Promise<{ text: string; vehicles: Vehicle[] }> {
  const q = question.toLowerCase().replace(/[’']/g, "'");
  const all = await getPublishedVehicles();
  const spanish = has(q, /\b(hola|tienen|camioneta|precio|cuánto|cuanto|millas|carro|coche|financiamiento|gracias)\b/);
  const es = spanish ? `\n\nPara ayuda en español, llámenos al ${business.phone.display}.` : "";

  // Never collect sensitive data in chat.
  if (/\b\d{3}-?\d{2}-?\d{4}\b/.test(q) || has(q, "social security", "ssn", "date of birth", "routing number", "card number")) {
    return { text: `Please don't share Social Security numbers, birth dates, or bank details here. To apply for financing, use our secure pre-qualification at [/financing](/financing).`, vehicles: [] };
  }

  // ── Dealership info intents ──
  if (has(q, /\b(hours?|open|close[sd]?|sunday|saturday|horario)\b/) && !has(q, "vehicle", "car", "truck", "suv"))
    return { text: `We're open ${hours}. You can book a visit or test drive at [/schedule](/schedule).${es}`, vehicles: [] };
  if (has(q, /\b(where|address|located|location|directions|dirección)\b/))
    return { text: `We're at ${business.address.street}, ${business.address.city}, ${business.address.region} ${business.address.postalCode} — in Live Oak, northeast of San Antonio. Hours: ${hours}. [Get directions](/contact).${es}`, vehicles: [] };
  if (has(q, /\b(human|person|someone|agent|salesperson|representative|real person)\b/) || has(q, /\bcall you\b/))
    return { text: `You can reach our team at ${business.phone.display} (${hours}) or send a message at [/contact](/contact).${es}`, vehicles: [] };
  if (has(q, "financ", "credit", "loan", "apr", "interest rate", "pre-qual", "prequal", "approved", "approval", "bad credit", "first time buyer", "first-time"))
    return {
      text: `We help with financing for many credit situations, including first-time buyers. Start with our secure pre-qualification at [/financing](/financing) (handled by ${business.financing.providerName}). Approval, rates, and terms depend on lender requirements — we can't promise a rate here, but our team will walk you through your options.${es}`,
      vehicles: [],
    };
  if (has(q, "trade in", "trade-in", "trade my", "my trade", "sell my car", "sell my"))
    return { text: `We'd be glad to look at your trade. Send the details and a few photos at [/trade-in](/trade-in) for a preliminary estimate — the final value is confirmed after an in-person inspection.${es}`, vehicles: [] };
  if (has(q, "deliver"))
    return { text: `We can discuss delivery to your home or office — request it at [/delivery](/delivery). Availability, eligibility, timing, distance, and fees must be confirmed by Auto Select.${es}`, vehicles: [] };
  if (has(q, "warranty", "service contract", "extended"))
    return { text: `Extended service protection may be available for vehicles outside the manufacturer's warranty. Coverage varies by plan — request a quote at [/service-contracts](/service-contracts).${es}`, vehicles: [] };
  if (has(q, "mechanic", "tow", "towing", "tire", "jump", "body shop", "paint", "dent", "repair"))
    return { text: `We offer mobile mechanic assistance, tires and wheel balancing, body repair and painting, towing, and jump starts. Request service at [/services](/services) and we'll follow up.${es}`, vehicles: [] };
  if (has(q, "test drive", "appointment", "schedule", "visit"))
    return { text: `You can request a test drive or appointment at [/schedule](/schedule), or use **Schedule test drive** on any vehicle page. We'll contact you to confirm the time (${hours}).${es}`, vehicles: [] };

  // ── "Similar" / "alternatives" while viewing a vehicle: same body style, closest price ──
  if (pageVehicle && has(q, /\b(similar|alternatives?|other options|more like|like this|comparable)\b/)) {
    const p = displayPrice(pageVehicle) ?? 0;
    const alts = all
      .filter((v) => v.id !== pageVehicle.id)
      .map((v) => ({ v, score: (v.bodyStyle === pageVehicle.bodyStyle ? 0 : 50_000) + Math.abs((displayPrice(v) ?? 0) - p) }))
      .sort((a, b) => a.score - b.score)
      .slice(0, 4)
      .map((x) => x.v);
    return {
      text: `Here are vehicles closest to the ${vehicleFullName(pageVehicle)} in body style and price:\n${alts.map(line).join("\n")}\n\n${confirmLine}${es}`,
      vehicles: alts,
    };
  }

  // ── Specific vehicle: stock number, "this car" on a vehicle page, or a uniquely named vehicle ──
  const stock = q.match(/\b([nt]{1,2}\d{5,6}t?)\b/i)?.[1];
  let target: Vehicle | null = stock ? await findVehicle(stock) : null;
  if (!target && pageVehicle && has(q, /\b(this|it|its|it's|the car|the truck|this one)\b/)) target = pageVehicle;

  // ── Parse search criteria ──
  const args: SearchArgs = { limit: 6 };
  const makes = [...new Set(all.map((v) => v.make))];
  const models = [...new Set(all.map((v) => v.model))];
  const aliasMake: Record<string, string> = { chevy: "Chevrolet", vw: "Volkswagen", beemer: "BMW", bimmer: "BMW" };
  args.make = makes.find((m) => q.includes(m.toLowerCase())) ?? Object.entries(aliasMake).find(([a]) => new RegExp(`\\b${a}\\b`).test(q))?.[1];
  args.model = models.find((m) => q.includes(m.toLowerCase()));
  if (has(q, /\b(trucks?|pickups?|camionetas?|troca|trocas)\b/)) args.body_style = "Pickup";
  else if (has(q, /\b(suv|suvs|crossover)\b/)) args.body_style = "SUV";
  else if (has(q, /\b(minivan|minivans|van)\b/)) args.body_style = "Minivan";
  else if (has(q, /\b(sedan|sedans)\b/)) args.body_style = "Sedan";

  const under = q.match(/(?:under|below|less than|max(?:imum)?|up to|no more than|<)\s*\$?\s*(\d[\d,]*(?:\.\d+)?)\s*(k)?\b(?!\s*(?:mi|miles))/);
  const over = q.match(/(?:over|above|more than|at least|min(?:imum)?|>)\s*\$?\s*(\d[\d,]*(?:\.\d+)?)\s*(k)?\b(?!\s*(?:mi|miles))/);
  const miles = q.match(/(?:under|below|less than|fewer than)\s*(\d[\d,]*)\s*(k)?\s*(?:mi|miles)/);
  if (under) args.max_price = num(under[1], under[2]);
  if (over) args.min_price = num(over[1], over[2]);
  if (miles) args.max_mileage = num(miles[1], miles[2]);
  if (args.max_price && args.max_price < 1000) args.max_price *= 1000; // "under 15" → $15,000
  const yearPlus = q.match(/\b((?:19|20)\d{2})\s*(?:or newer|and newer|\+|or later|and up)/) ?? q.match(/(?:newer than|after)\s*((?:19|20)\d{2})/);
  const yearExact = q.match(/\b(19[89]\d|20[0-3]\d)\b/);
  if (yearPlus) args.min_year = Number(yearPlus[1]);
  else if (yearExact && !stock) args.min_year = args.max_year = Number(yearExact[1]);
  if (has(q, "4x4", "4wd", "awd", "all wheel", "all-wheel", "four wheel")) args.drivetrain = "AWD";
  if (has(q, "third row", "3rd row", "7 seat", "seven seat", "7-passenger", "8-passenger", "8 seat", "family of 6", "family of 7")) args.min_seats = 7;
  if (has(q, "cheap", "lowest price", "least expensive", "affordable", "budget")) args.sort = "price_low";
  else if (has(q, "most expensive", "priciest", "high end", "luxury")) args.sort = "price_high";
  else if (has(q, "low mile", "lowest mile", "least miles", "fewest miles")) args.sort = "lowest_mileage";
  else if (has(q, "newest", "latest", "most recent")) args.sort = "newest_year";

  const hasCriteria = !!(args.make || args.model || args.body_style || args.max_price || args.min_price || args.max_mileage || args.min_year || args.drivetrain || args.min_seats || args.sort);

  if (!target && (args.make || args.model)) {
    const r = await searchInventory({ make: args.make, model: args.model });
    if (r.total_matches === 1 && !args.body_style && !args.max_price && !args.min_price) target = await findVehicle(r.vehicles[0].stock_number);
  }
  if (target && !has(q, /\b(other|similar|alternatives|else|more like)\b/)) return { text: vehicleAnswer(target, q) + es, vehicles: [target] };

  const browse = has(q, /\b(what|which|show|list|any|have|got|inventory|available|vehicles|cars|options|in stock|tienen)\b/);
  if (!hasCriteria && !browse) {
    return {
      text: `I can answer questions about the ${all.length} vehicles currently listed on our site. Try asking things like “Which SUVs do you have?”, “Anything under $12,000?”, “Do you have a 4x4 truck?”, or ask about a stock number. For anything else, call ${business.phone.display}.${es}`,
      vehicles: [],
    };
  }

  const result = await searchInventory(args);
  const matched = result.vehicles.map((c) => all.find((v) => v.stockNumber === c.stock_number)!).filter(Boolean);
  const desc = [
    args.min_seats ? "third-row" : "",
    args.drivetrain ? "AWD/4WD" : "",
    args.make ?? "",
    args.model ?? "",
    // "1 truck" vs "2 trucks"; the "no match" sentence uses the plural.
    (() => {
      const one = result.total_matches === 1;
      const noun = args.body_style === "Pickup" ? "truck" : args.body_style ?? "vehicle";
      return one ? noun : `${noun}s`;
    })(),
    args.max_price ? `under ${formatPrice(args.max_price)}` : "",
    args.min_price ? `over ${formatPrice(args.min_price)}` : "",
    args.max_mileage ? `under ${formatNumber(args.max_mileage)} miles` : "",
    args.min_year && args.max_year ? `from ${args.min_year}` : args.min_year ? `${args.min_year} or newer` : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (!matched.length) {
    // Relax price/mileage/year to suggest the closest alternatives.
    const relaxed = await searchInventory({ make: args.make, model: args.model, body_style: args.body_style, drivetrain: args.drivetrain, min_seats: args.min_seats, sort: "price_low", limit: 3 });
    const alts = relaxed.vehicles.map((c) => all.find((v) => v.stockNumber === c.stock_number)!).filter(Boolean);
    return {
      text: `I don't see any ${desc} listed right now.${alts.length ? ` Closest options:\n${alts.map(line).join("\n")}` : ""}\n\nWe can also search for one for you — tell us what you want at [/find-a-vehicle](/find-a-vehicle).${es}`,
      vehicles: alts,
    };
  }

  const shown = matched.slice(0, 5);
  const more = result.total_matches - shown.length;
  return {
    text: `We have ${result.total_matches} ${desc} listed:\n${shown.map(line).join("\n")}${more > 0 ? `\n…and ${more} more in [our inventory](/inventory).` : ""}\n\n${confirmLine}${es}`,
    vehicles: shown.slice(0, 4),
  };
}
