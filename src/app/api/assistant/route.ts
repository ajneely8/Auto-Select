import type { NextRequest } from "next/server";
import { z } from "zod";
import { env } from "@/config/env";
import { rateLimit } from "@/lib/leads/spam";
import { getVehicleBySlug } from "@/lib/inventory/repository";
import { vehicleFullName } from "@/lib/format";
import { runClaudeAssistant, shouldFallBack } from "@/lib/assistant/claude";
import { answerLocally } from "@/lib/assistant/local-engine";
import { toCard } from "@/lib/assistant/cards";
import type { AssistantEvent, ChatTurn } from "@/lib/assistant/types";

/**
 * POST /api/assistant — inventory questions assistant.
 * Body: { messages: [{ role, content }], path?: string }
 * Response: newline-delimited JSON AssistantEvent stream.
 * Uses Claude when ANTHROPIC_API_KEY is set; otherwise (or if the API is unavailable) the local rules engine.
 */
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().trim().min(1).max(1200) }))
    .min(1)
    .max(24)
    .refine((m) => m[m.length - 1].role === "user", "Last message must be from the user"),
  path: z.string().max(200).optional(),
});

export async function POST(req: NextRequest) {
  if (!env.ASSISTANT_ENABLED) return Response.json({ error: "Assistant is disabled." }, { status: 404 });

  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  const rl = rateLimit(`assistant:${ip}`, 20, 10 * 60 * 1000);
  if (!rl.ok) return Response.json({ error: "You've asked a lot of questions in a short time. Please wait a few minutes, or call us." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid request." }, { status: 400 });

  // Keep the conversation bounded (last 12 turns) and starting with a user turn.
  let history: ChatTurn[] = parsed.data.messages.slice(-12);
  while (history.length && history[0].role !== "user") history = history.slice(1);

  // If the shopper is on a vehicle page, tell the assistant which vehicle "this" refers to.
  const slug = parsed.data.path?.match(/^\/inventory\/([a-z0-9-]+)$/)?.[1];
  const pageVehicle = slug ? await getVehicleBySlug(slug) : null;
  if (pageVehicle) {
    const last = history[history.length - 1];
    history = [...history.slice(0, -1), { role: "user", content: `[The shopper is viewing the ${vehicleFullName(pageVehicle)}, stock ${pageVehicle.stockNumber}.]\n\n${last.content}` }];
  }
  const question = parsed.data.messages[parsed.data.messages.length - 1].content;

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      const emit = (e: AssistantEvent) => {
        if (!closed) controller.enqueue(encoder.encode(JSON.stringify(e) + "\n"));
      };
      const local = async () => {
        const r = await answerLocally(question, pageVehicle && pageVehicle.status !== "sold" ? pageVehicle : null);
        emit({ type: "text", delta: r.text });
        if (r.vehicles.length) emit({ type: "vehicles", vehicles: r.vehicles.map(toCard) });
        emit({ type: "done", mode: "local" });
      };
      try {
        if (env.ANTHROPIC_API_KEY) {
          let sentText = false;
          try {
            await runClaudeAssistant(history, (e) => {
              if (e.type === "text") sentText = true;
              emit(e);
            });
            emit({ type: "done", mode: "claude" });
          } catch (err) {
            console.error("[assistant] Claude request failed:", err);
            // Only fall back if nothing has been streamed yet; otherwise end gracefully.
            if (!sentText && shouldFallBack(err)) await local();
            else emit({ type: "error", message: "Sorry — I lost my connection. Please try again, or call us." });
          }
        } else {
          await local();
        }
      } catch (err) {
        console.error("[assistant] failed:", err);
        emit({ type: "error", message: "Sorry — something went wrong. Please try again, or call us." });
      } finally {
        closed = true;
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
  });
}
