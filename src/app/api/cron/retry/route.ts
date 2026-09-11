import { authorizeCron, unauthorized } from "@/lib/cron-auth";
import { processRetryQueue } from "@/lib/integrations/retry-queue";
import { postWebhook, type IntegrationName } from "@/lib/integrations";
import { retryDealerCenterUpload } from "@/lib/integrations/adf";

/** GET /api/cron/retry — re-sends failed email/SMS/CRM/DealerCenter deliveries with exponential backoff. Schedule every 10 minutes. */
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!authorizeCron(req)) return unauthorized();
  const result = await processRetryQueue(async (job) => {
    if (job.integration === "dealercenter-adf") {
      await retryDealerCenterUpload(job.payload);
      return;
    }
    await postWebhook(job.integration as IntegrationName, job.url, job.payload, { retry: false });
  });
  return Response.json(result);
}
