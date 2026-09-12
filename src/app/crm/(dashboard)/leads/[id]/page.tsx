import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Phone, Mail, MessageSquare, ArrowLeft, Image as ImageIcon, ExternalLink, MessageCircle, Gauge, Tag, Hash } from "lucide-react";
import { getLead } from "@/lib/crm/leads";
import { detailRows, contactSummary, formatDateTime, LEAD_LABELS } from "@/lib/crm/format";
import { TYPE_ICONS } from "@/lib/crm/icons";
import { getVehicleById } from "@/lib/inventory/repository";
import { vehicleFullName, formatPrice, formatMiles, statusLabel, displayPrice } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { StatusSelect } from "../../StatusSelect";
import { DeleteLeadButton } from "../../DeleteLeadButton";
import { NoteForm } from "./NoteForm";

const vehicleStatusTone = { available: "success", pending: "warning", sold: "neutral", "in-transit": "navy" } as const;

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

      <div className="mt-4 rounded-[var(--radius-lg)] border border-line bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <span className="flex size-14 shrink-0 items-center justify-center text-navy-700">
              <Icon className="size-8" aria-hidden />
            </span>
            <div>
              <span className="text-xs font-semibold text-navy-700">{LEAD_LABELS[lead.type]}</span>
              <h1 className="mt-1.5 font-display text-2xl font-bold text-ink sm:text-3xl">{c.name}</h1>
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

      <section aria-labelledby="contact-heading" className="mt-4 rounded-[var(--radius-lg)] border border-line bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
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
            <dd className="mt-1 flex flex-wrap gap-1.5">
              <Badge tone={lead.smsConsent ? "success" : "neutral"}>SMS {lead.smsConsent ? "yes" : "no"}</Badge>
              <Badge tone={lead.marketingConsent ? "success" : "neutral"}>Marketing {lead.marketingConsent ? "yes" : "no"}</Badge>
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
        <section aria-labelledby="vehicle-heading" className="mt-4 overflow-hidden rounded-[var(--radius-lg)] border border-line bg-white shadow-[var(--shadow-card)]">
          <div className="flex flex-col sm:flex-row">
            {vehicle.photos[0] && (
              <Link href={`/inventory/${vehicle.slug}`} target="_blank" className="block shrink-0 sm:w-64">
                <Image
                  src={vehicle.photos[0].url}
                  alt={vehicle.photos[0].alt}
                  width={480}
                  height={360}
                  className="h-48 w-full object-cover sm:h-full"
                />
              </Link>
            )}
            <div className="flex-1 p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <h2 id="vehicle-heading" className="font-display text-lg font-bold text-ink">
                  Vehicle
                </h2>
                <Badge tone={vehicleStatusTone[vehicle.status]}>{statusLabel[vehicle.status]}</Badge>
              </div>
              <Link
                href={`/inventory/${vehicle.slug}`}
                target="_blank"
                className="mt-1 inline-flex items-center gap-1.5 font-display text-xl font-bold text-navy-700 hover:underline"
              >
                {vehicleFullName(vehicle)}
                <ExternalLink className="size-4" aria-hidden />
              </Link>
              <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div>
                  <dt className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted">
                    <Tag className="size-3.5" aria-hidden /> Price
                  </dt>
                  <dd className="font-semibold text-ink">{formatPrice(displayPrice(vehicle))}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted">
                    <Gauge className="size-3.5" aria-hidden /> Mileage
                  </dt>
                  <dd className="font-semibold text-ink">{formatMiles(vehicle.mileage)}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted">
                    <Hash className="size-3.5" aria-hidden /> Stock
                  </dt>
                  <dd className="font-semibold text-ink">{vehicle.stockNumber}</dd>
                </div>
                {vehicle.exteriorColor && (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Color</dt>
                    <dd className="font-semibold text-ink">{vehicle.exteriorColor}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </section>
      )}

      {rows.length > 0 && (
        <section aria-labelledby="details-heading" className="mt-4 rounded-[var(--radius-lg)] border border-line bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
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
        <section aria-labelledby="photos-heading" className="mt-4 rounded-[var(--radius-lg)] border border-line bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
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

      <section aria-labelledby="source-heading" className="mt-4 rounded-[var(--radius-lg)] border border-line bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
        <h2 id="source-heading" className="font-display text-lg font-bold text-ink">
          Source
        </h2>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Page</dt>
            <dd className="break-all text-ink">{lead.sourcePage || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Referrer</dt>
            <dd className="break-all text-ink">{lead.referrer || "—"}</dd>
          </div>
          {utm.length > 0 && (
            <div className="sm:col-span-2">
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted">UTM</dt>
              <dd className="text-ink">{utm.map(([k, v]) => `${k}=${v}`).join(" · ")}</dd>
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
