"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, Phone, Mail, ArrowRight } from "lucide-react";
import type { Lead, LeadStatus, LeadType } from "@/lib/types";
import { STATUS_LABELS, STATUS_ORDER, TYPE_ORDER, contactSummary, relativeTime } from "@/lib/crm/format";
import { TYPE_ICONS } from "@/lib/crm/icons";
import { formatPrice } from "@/lib/format";
import { StatusBadge, StatusSelect } from "./StatusSelect";
import { DeleteLeadButton } from "./DeleteLeadButton";

const selectCls =
  "h-10 rounded-[var(--radius-sm)] border border-line-strong bg-white px-3 text-sm focus:border-accent-text focus:outline-none focus:ring-2 focus:ring-accent/25";

type Sort = "newest" | "oldest" | "name";

interface MonthOption {
  key: string;
  label: string;
  count: number;
}

export function LeadsTable({
  leads,
  typeLabels,
  months = [],
  initialMonth = "",
  vehiclePhotos = {},
}: {
  leads: Lead[];
  typeLabels: Record<LeadType, string>;
  months?: MonthOption[];
  initialMonth?: string;
  vehiclePhotos?: Record<string, { url: string; alt: string; name: string; price: number | null }>;
}) {
  const [q, setQ] = useState("");
  const [type, setType] = useState<LeadType | "">("");
  const [status, setStatus] = useState<LeadStatus | "">("");
  const [month, setMonth] = useState(initialMonth);
  const [sort, setSort] = useState<Sort>("newest");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = leads.filter((l) => {
      if (type && l.type !== type) return false;
      if (status && l.status !== status) return false;
      if (month && l.createdAt.slice(0, 7) !== month) return false;
      if (!term) return true;
      const vehicleLabel = (l.details as Record<string, unknown> | undefined)?.vehicleLabel;
      const haystack = [l.firstName, l.lastName, l.email, l.phone, l.message, l.id, typeof vehicleLabel === "string" ? vehicleLabel : ""].join(" ").toLowerCase();
      return haystack.includes(term);
    });
    const sorted = [...list];
    if (sort === "oldest") sorted.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    else if (sort === "name") sorted.sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`));
    else sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return sorted;
  }, [leads, q, type, status, month, sort]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email, phone, vehicle…"
            className="h-10 w-full rounded-[var(--radius-sm)] border border-line-strong bg-white pl-9 pr-3 text-sm focus:border-accent-text focus:outline-none focus:ring-2 focus:ring-accent/25"
            aria-label="Search leads"
          />
        </div>
        <select value={type} onChange={(e) => setType(e.target.value as LeadType | "")} className={selectCls} aria-label="Filter by form type">
          <option value="">All types</option>
          {TYPE_ORDER.map((t) => (
            <option key={t} value={t}>
              {typeLabels[t]}
            </option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value as LeadStatus | "")} className={selectCls} aria-label="Filter by status">
          <option value="">All statuses</option>
          {STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        {months.length > 0 && (
          <select value={month} onChange={(e) => setMonth(e.target.value)} className={selectCls} aria-label="Filter by month">
            <option value="">All time</option>
            {months.map((m) => (
              <option key={m.key} value={m.key}>
                {m.label} ({m.count})
              </option>
            ))}
          </select>
        )}
        <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className={selectCls} aria-label="Sort leads">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="name">Name (A–Z)</option>
        </select>
      </div>

      <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted">
        <span>
          {filtered.length} of {leads.length} leads
        </span>
        {month && (
          <span className="inline-flex items-center gap-1 rounded-full bg-navy-100 px-2.5 py-0.5 text-xs font-semibold text-navy-900">
            {months.find((m) => m.key === month)?.label ?? month}
            <button type="button" onClick={() => setMonth("")} className="ml-0.5 hover:text-navy-700" aria-label="Clear month filter">
              ×
            </button>
          </span>
        )}
      </p>

      {filtered.length === 0 ? (
        <div className="mt-4 rounded-[var(--radius-md)] border border-dashed border-line-strong bg-white p-10 text-center text-slate">
          {leads.length === 0 ? "No leads yet. They'll show up here as soon as someone submits a form." : "No leads match those filters."}
        </div>
      ) : (
        <ul className="mt-4 grid gap-4">
          {filtered.map((lead) => {
            const c = contactSummary(lead);
            const vehicleLabel = (lead.details as Record<string, unknown> | undefined)?.vehicleLabel;
            const Icon = TYPE_ICONS[lead.type];
            const photo = lead.vehicleId ? vehiclePhotos[lead.vehicleId] : undefined;
            return (
              <li
                key={lead.id}
                className="rounded-[var(--radius-lg)] border border-line bg-white p-4 shadow-[var(--shadow-card)] transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-[var(--shadow-raised)] sm:p-5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 gap-4">
                    {photo ? (
                      <Image
                        src={photo.url}
                        alt={photo.alt}
                        width={160}
                        height={120}
                        className="size-16 shrink-0 rounded-[var(--radius-md)] border border-line object-cover sm:size-20"
                      />
                    ) : (
                      <span className="flex size-16 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-line text-navy-700 sm:size-20">
                        <Icon className="size-6 sm:size-7" aria-hidden />
                      </span>
                    )}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-navy-700">
                          <Icon className="size-3.5" aria-hidden /> {typeLabels[lead.type]}
                        </span>
                        <StatusBadge status={lead.status} />
                        {/* Both the text and the title are computed from Date.now()/the browser's locale, which can
                            legitimately differ by a moment (or a timezone) between the server render and hydration
                            on the client — suppress the mismatch warning rather than fight an unwinnable diff. */}
                        <span className="text-xs text-muted" title={new Date(lead.createdAt).toLocaleString()} suppressHydrationWarning>
                          {relativeTime(lead.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1.5 truncate font-display text-lg font-bold text-ink sm:text-xl">{c.name}</p>
                      <div className="mt-0.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate">
                        {c.phone && (
                          <a href={`tel:${lead.phone}`} className="inline-flex items-center gap-1.5 hover:text-ink hover:underline">
                            <Phone className="size-3.5" aria-hidden /> {c.phone}
                          </a>
                        )}
                        {c.email && (
                          <a href={`mailto:${c.email}`} className="inline-flex items-center gap-1.5 hover:text-ink hover:underline">
                            <Mail className="size-3.5" aria-hidden /> {c.email}
                          </a>
                        )}
                      </div>
                      {(photo?.name || (typeof vehicleLabel === "string" && vehicleLabel)) && (
                        <p className="mt-1 truncate text-sm font-semibold text-navy-700">
                          {photo?.name ?? (vehicleLabel as string)}
                          {photo?.price != null && <span className="text-muted"> · {formatPrice(photo.price)}</span>}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:shrink-0">
                    <StatusSelect leadId={lead.id} status={lead.status} />
                    <Link
                      href={`/crm/leads/${lead.id}`}
                      className="inline-flex min-h-10 items-center gap-1.5 rounded-[var(--radius-sm)] border border-line-strong px-3 text-sm font-semibold text-ink hover:border-ink"
                    >
                      View <ArrowRight className="size-4" aria-hidden />
                    </Link>
                    <DeleteLeadButton leadId={lead.id} name={c.name} compact />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
