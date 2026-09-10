import "server-only";
import { dataDir } from "@/lib/data-dir";
import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * Failed integration deliveries land here and are retried by GET /api/cron/retry
 * (schedule it every 5–15 minutes; protected by CRON_SECRET). After MAX_ATTEMPTS a job
 * moves to the dead-letter file for manual review. Swap for a durable queue (SQS, Upstash QStash)
 * in serverless production.
 */
export interface RetryJob {
  id: string;
  integration: string;
  url: string;
  payload: unknown;
  attempts: number;
  lastError: string;
  nextAttemptAt: number;
  createdAt: string;
}

const MAX_ATTEMPTS = 6;
const dir = () => dataDir();
const queueFile = () => path.join(dir(), "retry-queue.json");
const deadFile = () => path.join(dir(), "dead-letter.ndjson");

async function readQueue(): Promise<RetryJob[]> {
  try {
    return JSON.parse(await fs.readFile(queueFile(), "utf8")) as RetryJob[];
  } catch {
    return [];
  }
}

async function writeQueue(jobs: RetryJob[]) {
  await fs.mkdir(dir(), { recursive: true });
  await fs.writeFile(queueFile(), JSON.stringify(jobs, null, 2));
}

export async function enqueueRetry(job: { integration: string; url: string; payload: unknown; error: string }) {
  try {
    const jobs = await readQueue();
    jobs.push({
      id: `job_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      integration: job.integration,
      url: job.url,
      payload: job.payload,
      attempts: 1,
      lastError: job.error,
      nextAttemptAt: Date.now() + 60_000,
      createdAt: new Date().toISOString(),
    });
    await writeQueue(jobs);
  } catch (err) {
    // Last resort: the log is the queue.
    console.error("[retry-queue] could not persist job:", err, JSON.stringify(job).slice(0, 500));
  }
}

export async function processRetryQueue(send: (job: RetryJob) => Promise<void>) {
  const jobs = await readQueue();
  const keep: RetryJob[] = [];
  let delivered = 0;
  let dead = 0;
  for (const job of jobs) {
    if (job.nextAttemptAt > Date.now()) {
      keep.push(job);
      continue;
    }
    try {
      await send(job);
      delivered++;
    } catch (err) {
      job.attempts++;
      job.lastError = String(err);
      if (job.attempts >= MAX_ATTEMPTS) {
        dead++;
        await fs.appendFile(deadFile(), JSON.stringify(job) + "\n").catch(() => {});
      } else {
        job.nextAttemptAt = Date.now() + 60_000 * 2 ** job.attempts; // exponential backoff
        keep.push(job);
      }
    }
  }
  await writeQueue(keep);
  return { delivered, dead, pending: keep.length };
}
