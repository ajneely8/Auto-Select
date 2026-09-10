import Link from "next/link";
import { notFound } from "next/navigation";
import { Phone, Mail, MessageSquare, ArrowLeft, Image as ImageIcon, ExternalLink, MessageCircle } from "lucide-react";
import { getLead } from "@/lib/crm/leads";
import { detailRows, contactSummary, formatDateTime, LEAD_LABELS } from "@/lib/crm/format";
import { TYPE_ICONS } from "@/lib/crm/icons";
import { getVehicleById } from "@/lib/inventory/repository";
import { vehicleFullName } from "@/lib/format";
import { StatusSelect } from "../../StatusSelect";
import { DeleteLeadButton } from "../../DeleteLeadButton";
import { NoteForm } from "./NoteForm";

export const metadata = { title: "Lead", robots: { index: false, follow: false } };

export default async function LeadDetailPage({ params }: PageProps<"/crm/leads/[id]">) {
  const { id } = await params;
  const lead = await getLead(id);
  if (!lead) notFound();

  const c = contactSummary(lead);
  const rows = detailRows(lead);
  const vehicle = lead.vehicleId ? await getVehicleById(lead.vehicleId) : null;
  const photoFiles = (lead.details as Record<string, unknown> | undefined)?.photoFiles;
  const photos = Array.isArray(photoFiles) ? (photoFiles as string[]) : [];
  const utm = Object.entries(lead.utmData ?? {}).filter(([, v]) => v);
  const Icon = TYPE_ICONS[lead.type];

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/crm/leads" className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-700 hover:underline">
        <ArrowLeft className="size-4" aria-hidden /> Back to leads
      </Link>

      <div className="mt-4 rounded-[var(--radius-md)] border border-line bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-navy-100 text-navy-900">
              <Icon className="size-5" aria-hidden />
            </span>
            <div>
              <span className="inline-flex items-center rounded-[var(--radius-xs)] bg-navy-100 px-2 py-0.5 text-xs font-semibold text-navy-900">{LEAD_LABELS[lead.type]}</span>
              <h1 className="mt-1.5 font-display text-2xl font-bold text-ink">{c.name}</h1>
              <p className="mt-1 text-sm text-muted">
                Submitted {formatDateTime(lead.createdAt)} · Reference {lead.id}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusSelect leadId={lead.id} status={lead.status} />
            <DeleteLeadButton leadId={lead.id} name={c.name} redirectTo="/crm/leads" />
          </div>
        </div>
        {(c.phone || c.email) && (
          <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
            {c.phone && (
              <a href={`tel:${lead.phone}`} className="inline-flex min-h-9 items-center gap-1.5 rounded-[var(--radius-sm)] border border-line-strong px-3 text-sm font-semibold text-ink hover:border-ink">
                <Phone className="size-4" aria-hidden /> Call
              </a>
            )}
            {c.phone && lead.smsConsent && (
              <a
                href={`sms:${lead.phone}`}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-[var(--radius-sm)] border border-line-strong px-3 text-sm font-semibold text-ink hover:border-ink"
              >
                <MessageCircle className="size-4" aria-hidden /> Text
              </a>
            )}
            {c.email && (
              <a
                href={`mailto:${c.email}`}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-[var(--radius-sm)] border border-line-strong px-3 text-sm font-semibold text-ink hover:border-ink"
              >
                <Mail className="size-4" aria-hidden /> Email
              </a>
            )}
          </div>
        )}
      </div>

      <section aria-labelledby="contact-heading" className="mt-4 rounded-[var(--radius-md)] border border-line bg-white p-5 sm:p-6">
        <h2 id="contact-heading" className="font-display text-lg font-bold text-ink">
          Contact
        </h2>
        <dl className="mt-3 grid gap-3 sm:grid-cols-2">
          {c.phone && (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Phone</dt>
              <dd>
                <a href={`tel:${lead.phone}`} className="inline-flex items-center gap-1.5 font-semibold text-navy-700 hover:underline">
                  <Phone className="size-4" aria-hidden /> {c.phone}
                </a>
              </dd>
            </div>
          )}
          {c.email && (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Email</dt>
              <dd>
                <a href={`mailto:${c.email}`} className="inline-flex items-center gap-1.5 font-semibold text-navy-700 hover:underline">
                  <Mail className="size-4" aria-hidden /> {c.email}
                </a>
              </dd>
            </div>
          )}
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Prefers</dt>
            <dd className="text-ink capitalize">{lead.preferredContactMethod}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Consent</dt>
            <dd className="text-ink">
              SMS: {lead.smsConsent ? "Yes" : "No"} · Marketing emails: {lead.marketingConsent ? "Yes" : "No"}
            </dd>
          </div>
        </dl>
        {lead.message && (
          <div className="mt-4 border-t border-line pt-4">
            <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
              <MessageSquare className="size-3.5" aria-hidden /> Message
            </dt>
            <dd className="mt-1.5 whitespace-pre-wrap text-ink">{lead.message}</dd>
          </div>
        )}
      </section>

      {vehicle && (
        <section aria-labelledby="vehicle-heading" className="mt-4 rounded-[var(--radius-md)] border border-line bg-white p-5 sm:p-6">
          <h2 id="vehicle-heading" className="font-display text-lg font-bold text-ink">
            Vehicle
          </h2>
          <Link href={`/inventory/${vehicle.slug}`} target="_blank" className="mt-2 inline-flex items-center gap-1.5 font-semibold text-navy-700 hover:underline">
            {vehicleFullName(vehicle)} · Stock {vehicle.stockNumber}
            <ExternalLink className="size-3.5" aria-hidden />
          </Link>
        </section>
      )}

      {rows.length > 0 && (
        <section aria-labelledby="details-heading" className="mt-4 rounded-[var(--radius-md)] border border-line bg-white p-5 sm:p-6">
          <h2 id="details-heading" className="font-display text-lg font-bold text-ink">
            Submitted details
          </h2>
          <dl className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {rows.map((r) => (
              <div key={r.key}>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{r.label}</dt>
                <dd className="text-ink">{r.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {photos.length > 0 && (
        <section aria-labelledby="photos-heading" className="mt-4 rounded-[var(--radius-md)] border border-line bg-white p-5 sm:p-6">
          <h2 id="photos-heading" className="flex items-center gap-1.5 font-display text-lg font-bold text-ink">
            <ImageIcon className="size-4" aria-hidden /> Photos ({photos.length})
          </h2>
          <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {photos.map((p) => (
              <li key={p}>
                <a href={`/crm/leads/${lead.id}/photos/${encodeURIComponent(p.split("/").pop() ?? "")}`} target="_blank" rel="noopener noreferrer">
                  {/* Plain <img>, deliberately: next/image's optimizer fetches server-side without our
                      session cookie, so it can't reach this authenticated route. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/crm/leads/${lead.id}/photos/${encodeURIComponent(p.split("/").pop() ?? "")}`}
                    alt="Trade-in photo"
                    className="aspect-square w-full rounded-[var(--radius-sm)] border border-line object-cover"
                  />
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="source-heading" className="mt-4 rounded-[var(--radius-md)] border border-line bg-white p-5 text-sm text-slate sm:p-6">
        <h2 id="source-heading" className="font-display text-lg font-bold text-ink">
          Source
        </h2>
        <dl className="mt-3 grid gap-2">
          <div className="flex gap-2">
            <dt className="w-28 shrink-0 font-semibold text-muted">Page</dt>
            <dd className="break-all">{lead.sourcePage || "—"}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-28 shrink-0 font-semibold text-muted">Referrer</dt>
            <dd className="break-all">{lead.referrer || "—"}</dd>
          </div>
          {utm.length > 0 && (
            <div className="flex gap-2">
              <dt className="w-28 shrink-0 font-semibold text-muted">UTM</dt>
              <dd>{utm.map(([k, v]) => `${k}=${v}`).join(" · ")}</dd>
            </div>
          )}
        </dl>
      </section>

      <div className="mt-4">
        <NoteForm leadId={lead.id} notes={lead.notes ?? []} />
      </div>
    </div>
  );
}
