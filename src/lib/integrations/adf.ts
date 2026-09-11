import "server-only";
import SftpClient from "ssh2-sftp-client";
import { business } from "@/config/business";
import { siteUrl } from "@/config/site";
import { env } from "@/config/env";
import { enqueueRetry } from "./retry-queue";
import type { Lead } from "@/lib/types";
import type { Vehicle } from "@/lib/types";

/**
 * ADF (Auto-lead Data Format) 1.0 — the industry-standard XML format nearly every dealership
 * CRM/DMS (DealerCenter, VinSolutions, DealerSocket, ELEAD, ...) accepts leads in. Spec:
 * https://adfxml.info/adf_spec.pdf
 *
 * The DTD requires at least one <vehicle> block per prospect even for leads that aren't about a
 * specific car (financing, service, general contact, ...). "Unknown" for year/make/model is the
 * conventional placeholder other ADF producers use for exactly this case.
 */
function xmlEscape(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function tag(name: string, content: string | number | null | undefined, attrs: Record<string, string> = {}): string {
  if (content == null || content === "") return "";
  const attrString = Object.entries(attrs)
    .map(([k, v]) => ` ${k}="${xmlEscape(v)}"`)
    .join("");
  return `<${name}${attrString}>${xmlEscape(String(content))}</${name}>`;
}

export function buildAdfXml(lead: Lead, vehicle: Vehicle | null): string {
  const requestDate = new Date(lead.createdAt).toISOString().replace(/\.\d{3}Z$/, "-00:00");

  const vehicleBlock = vehicle
    ? [
        tag("year", vehicle.year),
        tag("make", vehicle.make),
        tag("model", vehicle.model),
        vehicle.trim ? tag("trim", vehicle.trim) : "",
        tag("vin", vehicle.vin),
        tag("stock", vehicle.stockNumber),
        vehicle.price != null ? tag("price", vehicle.price, { type: "asking", currency: "USD" }) : "",
      ].join("")
    : [tag("year", "Unknown"), tag("make", "Unknown"), tag("model", "Unknown")].join("");

  const nameParts = [lead.firstName ? tag("name", lead.firstName, { part: "first" }) : "", lead.lastName ? tag("name", lead.lastName, { part: "last" }) : ""].join("");

  const contactParts = [
    nameParts || tag("name", "Website visitor", { part: "full" }),
    lead.email ? tag("email", lead.email) : "",
    lead.phone ? tag("phone", lead.phone, { type: "voice", time: "nopreference" }) : "",
  ].join("");

  const customerComments = [lead.message, vehicle ? "" : `Form type: ${lead.type}`].filter(Boolean).join(" — ");

  return [
    '<?ADF VERSION "1.0"?>',
    '<?XML VERSION "1.0"?>',
    "<adf>",
    '<prospect status="new">',
    tag("id", lead.id, { sequence: "1", source: business.name }),
    tag("requestdate", requestDate),
    `<vehicle interest="buy" status="${vehicle?.condition === "new" ? "new" : "used"}">${vehicleBlock}</vehicle>`,
    `<customer><contact>${contactParts}</contact>${customerComments ? tag("comments", customerComments) : ""}</customer>`,
    `<vendor>${tag("vendorname", business.name)}<contact>${tag("name", business.name, { part: "full" })}${tag("email", business.email)}${tag("phone", business.phone.display, { type: "voice" })}<address>${tag("street", business.address.street, { line: "1" })}${tag("city", business.address.city)}${tag("regioncode", business.address.region)}${tag("postalcode", business.address.postalCode)}${tag("country", business.address.country)}</address></contact></vendor>`,
    `<provider>${tag("name", business.name, { part: "full" })}${tag("service", "Website lead")}${tag("url", siteUrl)}${tag("email", business.email)}</provider>`,
    "</prospect>",
    "</adf>",
  ].join("\n");
}

function isDealerCenterConfigured(): boolean {
  return !!(env.DEALERCENTER_SFTP_HOST && env.DEALERCENTER_SFTP_USERNAME && env.DEALERCENTER_SFTP_PASSWORD);
}

async function uploadAdfFile(adfXml: string, filename: string): Promise<void> {
  const client = new SftpClient();
  try {
    await client.connect({
      host: env.DEALERCENTER_SFTP_HOST,
      port: env.DEALERCENTER_SFTP_PORT,
      username: env.DEALERCENTER_SFTP_USERNAME,
      password: env.DEALERCENTER_SFTP_PASSWORD,
      readyTimeout: 10_000,
    });
    const remotePath = `${env.DEALERCENTER_SFTP_PATH.replace(/\/$/, "")}/${filename}`;
    await client.put(Buffer.from(adfXml, "utf8"), remotePath);
  } finally {
    await client.end().catch(() => {});
  }
}

/** Drops an ADF XML file for this lead into DealerCenter's (or any ADF-over-SFTP CRM's) dealer-specific dropbox. */
export async function pushLeadToDealerCenter(lead: Lead, vehicle: Vehicle | null): Promise<{ delivered: boolean; mode: "sftp" | "log-only" }> {
  if (!isDealerCenterConfigured()) {
    console.info(`[dealercenter:log-only] lead ${lead.id} not sent (DEALERCENTER_SFTP_* not configured)`);
    return { delivered: false, mode: "log-only" };
  }
  const adfXml = buildAdfXml(lead, vehicle);
  const filename = `${lead.id}-${Date.now()}.xml`;
  try {
    await uploadAdfFile(adfXml, filename);
    return { delivered: true, mode: "sftp" };
  } catch (err) {
    console.error("[dealercenter] SFTP upload failed:", err);
    await enqueueRetry({
      integration: "dealercenter-adf",
      url: `sftp://${env.DEALERCENTER_SFTP_HOST}${env.DEALERCENTER_SFTP_PATH}`,
      payload: { adfXml, filename },
      error: String(err),
    });
    return { delivered: false, mode: "log-only" };
  }
}

/** Re-attempts a queued DealerCenter upload with the exact same ADF file — called from /api/cron/retry. */
export async function retryDealerCenterUpload(payload: unknown): Promise<void> {
  const { adfXml, filename } = payload as { adfXml: string; filename: string };
  await uploadAdfFile(adfXml, filename);
}
