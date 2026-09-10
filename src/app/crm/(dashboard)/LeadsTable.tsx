"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, Phone, Mail, ArrowRight } from "lucide-react";
import type { Lead, LeadStatus, LeadType } from "@/lib/types";
import { STATUS_LABELS, STATUS_ORDER, TYPE_ORDER, contactSummary, relativeTime } from "@/lib/crm/format";
import { StatusBadge, StatusSelect } from "./StatusSelect";

const selectCls =
  "h-10 rounded-[var(--radius-sm)] border border-line-strong bg-white px-3 text-sm focus:border-accent-text focus:outline-none focus:ring-2 focus:ring-accent/25";

export function LeadsTable({ leads, typeLabels }: { leads: Lead[]; typeLabels: Record<LeadType, string> }) {
  const [q, setQ] = useState("");
  const [type, setType] = useState<LeadType | "">("");
  const [status, setStatus] = useState<LeadStatus | "">("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return leads.filter((l) => {
      if (type && l.type !== type) return false;
      if (status && l.status !== status) return false;
      if (!term) return true;
      const vehicleLabel = (l.details as Record<string, unknown> | undefined)?.vehicleLabel;
      const haystack = [l.firstName, l.lastName, l.email, l.phone, l.message, l.id, typeof vehicleLabel === "string" ? vehicleLabel : ""].join(" ").toLowerCase();
      return haystack.includes(term);
    });
  }, [leads, q, type, status]);

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
      </div>

      <p className="mt-3 text-sm text-muted">
        {filtered.length} of {leads.length} leads
      </p>

      {filtered.length === 0 ? (
        <div className="mt-4 rounded-[var(--radius-md)] border border-dashed border-line-strong bg-white p-10 text-center text-slate">
          {leads.length === 0 ? "No leads yet. They'll show up here as soon as someone submits a form." : "No leads match those filters."}
        </div>
      ) : (
        <ul className="mt-4 grid gap-3">
          {filtered.map((lead) => {
            const c = contactSummary(lead);
            const vehicleLabel = (lead.details as Record<string, unknown> | undefined)?.vehicleLabel;
            return (
              <li key={lead.id} className="rounded-[var(--radius-md)] border border-line bg-white p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center rounded-[var(--radius-xs)] bg-navy-100 px-2 py-0.5 text-xs font-semibold text-navy-900">{typeLabels[lead.type]}</span>
                      <StatusBadge status={lead.status} />
                      <span className="text-xs text-muted" title={new Date(lead.createdAt).toLocaleString()}>
                        {relativeTime(lead.createdAt)}
                      </span>
                    </div>
                    <p className="mt-2 truncate font-display text-lg font-bold text-ink">{c.name}</p>
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
                      {typeof vehicleLabel === "string" && vehicleLabel && <span className="text-navy-700">{vehicleLabel}</span>}
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
