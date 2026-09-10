import "server-only";
import path from "node:path";
import { env } from "@/config/env";

/**
 * Runtime data directory for the file-based adapters (leads, uploads, retry queue, subscriptions).
 * The ignore hint stops the bundler from tracing the whole project into the server output,
 * since this path is only known at runtime.
 */
export function dataDir(...parts: string[]) {
  return path.resolve(/* turbopackIgnore: true */ process.cwd(), env.LEAD_DATA_DIR, ...parts);
}
