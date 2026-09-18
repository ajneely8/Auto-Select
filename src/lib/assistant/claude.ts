import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { env } from "@/config/env";
import { business } from "@/config/business";
import { ASSISTANT_SYSTEM_PROMPT } from "./prompt";
import { searchInventory, getVehicleDetails, estimatePayment, findVehicle, captureLead, type SearchArgs, type CaptureLeadArgs } from "./tools";
import type { LeadContext } from "@/lib/leads/pipeline";
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
  {
    name: "capture_lead",
    description:
      "Submit a qualified lead to the Auto Select sales team once you have at minimum a first name, phone number, and email. Call this only after gathering real context through conversation (what they're looking for, budget, financing vs. cash, trade-in) — never call it just because someone gave contact info with no other context. Only call this once per conversation.",
    input_schema: {
      type: "object",
      properties: {
        first_name: { type: "string" },
        phone: { type: "string", description: "10-digit US phone number." },
        email: { type: "string" },
        vehicle_interest: { type: "string", description: "Specific make/model/vehicle they're interested in, if mentioned." },
        vehicle_type: { type: "string", description: "Truck, SUV, Sedan, Coupe, Van, or similar — if mentioned." },
        budget: { type: "number", description: "Their stated budget in USD, if given." },
        financing_preference: { type: "string", enum: ["finance", "cash", "unsure"] },
        has_trade_in: { type: "string", enum: ["yes", "no", "unsure"] },
        trade_year: { type: "string" },
        trade_make: { type: "string" },
        trade_model: { type: "string" },
        trade_mileage: { type: "string" },
        appointment_preference: { type: "string", description: "When they said they'd like to visit, e.g. 'tomorrow afternoon' — free text, not a confirmed slot." },
        conversation_summary: { type: "string", description: "2-4 sentence plain-English summary of what this visitor wants, for the salesperson following up." },
      },
      required: ["first_name", "phone", "email", "conversation_summary"],
      additionalProperties: false,
    },
  },
];

async function runTool(name: string, input: Record<string, unknown>, emit: (e: AssistantEvent) => void, ctx: LeadContext): Promise<unknown> {
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
    case "capture_lead": {
      const result = await captureLead(input as unknown as CaptureLeadArgs, ctx);
      if (result.ok && result.leadId) {
        emit({ type: "lead_captured", leadId: result.leadId });
        emit({ type: "quick_replies", options: ["Schedule a Visit", "Have Someone Contact Me"] });
      }
      return result;
    }
    default:
      return { error: `Unknown tool ${name}` };
  }
}

const supportsServerFallbacks = (model: string) => /^claude-(opus-5|fable-5-1)/.test(model);
const supportsAdaptiveThinking = (model: string) => !/haiku|claude-3/.test(model);

export async function runClaudeAssistant(history: ChatTurn[], emit: (e: AssistantEvent) => void, ctx: LeadContext) {
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
          const out = await runTool(t.name, (t.input ?? {}) as Record<string, unknown>, emit, ctx);
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
