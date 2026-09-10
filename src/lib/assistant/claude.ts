import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { env } from "@/config/env";
import { business } from "@/config/business";
import { ASSISTANT_SYSTEM_PROMPT } from "./prompt";
import { searchInventory, getVehicleDetails, estimatePayment, findVehicle, type SearchArgs } from "./tools";
import { toCard } from "./cards";
import type { AssistantEvent, ChatTurn } from "./types";

/**
 * Claude-backed inventory assistant: a manual streaming tool loop.
 * - Model: ASSISTANT_MODEL (default claude-opus-5) with adaptive thinking at low effort — chat is latency-sensitive.
 * - Server-side refusal fallbacks ("default") are enabled for Opus 5 / Fable 5.1.
 * - Tools read the same inventory repository the website uses, so answers stay grounded in live listings.
 */

let client: Anthropic | null = null;
const getClient = () => (client ??= new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, maxRetries: 2, timeout: 60_000 }));

const tools: Anthropic.Beta.BetaTool[] = [
  {
    name: "search_inventory",
    description:
      "Search the vehicles currently listed on the Auto Select website. All filters are optional; combine them as needed. Returns matching vehicles (stock number, title, price, mileage, body style, drivetrain, fuel, colors, url) plus total counts. Use broad searches (no filters) to see everything.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Free-text keywords, e.g. 'white', 'crewmax', 'platinum'." },
        make: { type: "string", description: "e.g. Toyota, Nissan, BMW" },
        model: { type: "string", description: "e.g. Tundra, Altima, 5 Series" },
        body_style: { type: "string", enum: ["Sedan", "SUV", "Pickup Truck", "Minivan", "Coupe", "Hatchback", "Wagon", "Convertible"] },
        min_price: { type: "number" },
        max_price: { type: "number" },
        max_mileage: { type: "number" },
        min_year: { type: "integer" },
        max_year: { type: "integer" },
        drivetrain: { type: "string", description: "FWD, RWD, AWD, or 4WD. 'AWD' or '4WD' matches both all-wheel and four-wheel drive." },
        fuel_type: { type: "string", description: "e.g. Gasoline, Flex Fuel, Hybrid, Diesel, Electric" },
        min_seats: { type: "integer", description: "Minimum seating capacity, e.g. 7 for third-row seating." },
        feature: { type: "string", description: "A listed feature to require, e.g. 'Third-row seating'." },
        sort: { type: "string", enum: ["price_low", "price_high", "newest_year", "lowest_mileage", "newest_arrivals"] },
        limit: { type: "integer", minimum: 1, maximum: 12 },
      },
      additionalProperties: false,
    },
  },
  {
    name: "get_vehicle_details",
    description:
      "Get the full website listing for one vehicle: specs, engine, transmission, seats, listed features, description, photo count, 360 availability. Identify it by stock number (preferred), vehicle page url, or last 6 of the VIN.",
    input_schema: {
      type: "object",
      properties: { vehicle: { type: "string", description: "Stock number (e.g. N246488), /inventory/<slug> url, or last 6 VIN characters." } },
      required: ["vehicle"],
      additionalProperties: false,
    },
  },
  {
    name: "estimate_payment",
    description:
      "Estimate a monthly payment for illustration only (not an offer of credit). If the shopper didn't give an APR, omit it and an example rate is used. Always relay the returned assumptions and disclaimer.",
    input_schema: {
      type: "object",
      properties: {
        price: { type: "number", description: "Vehicle price in USD." },
        down_payment: { type: "number" },
        trade_value: { type: "number", description: "Trade-in equity in USD (value minus payoff)." },
        apr: { type: "number", description: "Annual percentage rate the shopper wants to try, e.g. 7.5." },
        term_months: { type: "integer", enum: [36, 48, 60, 72, 84] },
      },
      required: ["price"],
      additionalProperties: false,
    },
  },
  {
    name: "show_vehicle_cards",
    description: "Display vehicle cards (photo, price, mileage, link) under your reply for the vehicles you are recommending or discussing. Up to 4 stock numbers.",
    input_schema: {
      type: "object",
      properties: { stock_numbers: { type: "array", items: { type: "string" }, maxItems: 4 } },
      required: ["stock_numbers"],
      additionalProperties: false,
    },
  },
];

async function runTool(name: string, input: Record<string, unknown>, emit: (e: AssistantEvent) => void): Promise<unknown> {
  switch (name) {
    case "search_inventory":
      return searchInventory(input as SearchArgs);
    case "get_vehicle_details":
      return getVehicleDetails(String(input.vehicle ?? ""));
    case "estimate_payment":
      return estimatePayment(input as Parameters<typeof estimatePayment>[0]);
    case "show_vehicle_cards": {
      const refs = Array.isArray(input.stock_numbers) ? input.stock_numbers.slice(0, 4).map(String) : [];
      const found = (await Promise.all(refs.map(findVehicle))).filter((v) => v != null);
      if (found.length) emit({ type: "vehicles", vehicles: found.map(toCard) });
      return { displayed: found.map((v) => v.stockNumber), not_found: refs.filter((r) => !found.some((v) => v.stockNumber.toLowerCase() === r.toLowerCase())) };
    }
    default:
      return { error: `Unknown tool ${name}` };
  }
}

const supportsServerFallbacks = (model: string) => /^claude-(opus-5|fable-5-1)/.test(model);
const supportsAdaptiveThinking = (model: string) => !/haiku|claude-3/.test(model);

export async function runClaudeAssistant(history: ChatTurn[], emit: (e: AssistantEvent) => void) {
  const model = env.ASSISTANT_MODEL;
  const messages: Anthropic.Beta.BetaMessageParam[] = history.map((t) => ({ role: t.role, content: t.content }));

  for (let iteration = 0; iteration < 6; iteration++) {
    const stream = getClient().beta.messages.stream({
      model,
      max_tokens: 8000,
      ...(supportsServerFallbacks(model) ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const } : {}),
      ...(supportsAdaptiveThinking(model) ? { thinking: { type: "adaptive" as const }, output_config: { effort: "low" as const } } : {}),
      system: [{ type: "text", text: ASSISTANT_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
      tools,
      messages,
    });
    stream.on("text", (delta) => emit({ type: "text", delta }));
    const message = await stream.finalMessage();

    if (message.stop_reason === "refusal") {
      emit({ type: "text", delta: `\n\nI can't help with that here. For anything about our vehicles, financing, or services, I'm happy to help — or call us at ${business.phone.display}.` });
      return;
    }
    if (message.stop_reason === "pause_turn") {
      messages.push({ role: "assistant", content: message.content });
      continue;
    }
    if (message.stop_reason !== "tool_use") return;

    const toolUses = message.content.filter((b): b is Anthropic.Beta.BetaToolUseBlock => b.type === "tool_use");
    messages.push({ role: "assistant", content: message.content });
    if (toolUses.some((t) => t.name !== "show_vehicle_cards")) emit({ type: "status", message: "Checking our inventory…" });

    // Run tools in parallel and return every result in ONE user message.
    const results: Anthropic.Beta.BetaToolResultBlockParam[] = await Promise.all(
      toolUses.map(async (t) => {
        try {
          const out = await runTool(t.name, (t.input ?? {}) as Record<string, unknown>, emit);
          return { type: "tool_result" as const, tool_use_id: t.id, content: JSON.stringify(out) };
        } catch (err) {
          return { type: "tool_result" as const, tool_use_id: t.id, content: `Tool failed: ${String(err)}`, is_error: true };
        }
      }),
    );
    messages.push({ role: "user", content: results });
  }
}

/** Errors worth falling back to the local engine for (config/network/provider problems). */
export function shouldFallBack(err: unknown) {
  return (
    err instanceof Anthropic.AuthenticationError ||
    err instanceof Anthropic.PermissionDeniedError ||
    err instanceof Anthropic.NotFoundError ||
    err instanceof Anthropic.RateLimitError ||
    err instanceof Anthropic.InternalServerError ||
    err instanceof Anthropic.APIConnectionError ||
    err instanceof Anthropic.BadRequestError
  );
}
