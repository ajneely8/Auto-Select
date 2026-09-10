import Link from "next/link";
import { Users, Clock, TrendingUp, ArrowRight, CheckCircle2, Phone, Mail } from "lucide-react";
import { listLeads, summarize, typeBreakdown, needsAttention, dailyCounts, responseRate, weeklyTrend } from "@/lib/crm/leads";
import { LEAD_LABELS, STATUS_LABELS, contactSummary, relativeTime } from "@/lib/crm/format";
import { TYPE_ICONS } from "@/lib/crm/icons";
import { StatusBadge } from "./StatusSelect";
import { LeadsTrendChart } from "./Sparkline";

export const metadata = { title: "Overview", robots: { index: false, follow: false } };

export default async function CrmOverviewPage() {
  const leads = await listLeads();
  const counts = summarize(leads);
  const sources = typeBreakdown(leads);
  const attention = needsAttention(leads, 24);
  const trend = dailyCounts(leads, 14);
  const rate = responseRate(leads);
  const { last7, deltaPct: trendDelta } = weeklyTrend(leads);
  const recent = leads.slice(0, 6);
  const maxSource = Math.max(1, ...sources.map((s) => s.count));

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Overview</h1>
        <p className="mt-1 text-sm text-slate">A snapshot of every lead coming through the website.</p>
      </div>

      {/* Headline stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Users} label="Total leads" value={counts.total} />
        <StatCard
          icon={TrendingUp}
          label="Last 7 days"
          value={last7}
          trend={trendDelta == null ? undefined : `${trendDelta >= 0 ? "+" : ""}${trendDelta}% vs. prior week`}
          trendTone={trendDelta == null ? undefined : trendDelta >= 0 ? "success" : "warning"}
        />
        <StatCard icon={Clock} label="Needs attention" value={attention.length} tone={attention.length > 0 ? "warning" : undefined} />
        <StatCard icon={CheckCircle2} label="Response rate" value={rate == null ? "—" : `${rate}%`} hint="Not new or spam" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Trend chart */}
        <section aria-labelledby="trend-heading" className="rounded-[var(--radius-md)] border border-line bg-white p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 id="trend-heading" className="font-display text-lg font-bold text-ink">
              Leads, last 14 days
            </h2>
            <span className="text-sm text-muted tabular">{trend.reduce((n, d) => n + d.count, 0)} total</span>
          </div>
          <div className="mt-4">
            <LeadsTrendChart data={trend} />
          </div>
        </section>

        {/* Needs attention */}
        <section aria-labelledby="attention-heading" className="rounded-[var(--radius-md)] border border-line bg-white p-5">
          <h2 id="attention-heading" className="font-display text-lg font-bold text-ink">
            Needs attention
          </h2>
          <p className="mt-0.5 text-xs text-muted">New leads sitting more than 24 hours</p>
          {attention.length === 0 ? (
            <p className="mt-4 rounded-[var(--radius-sm)] bg-success-soft px-3 py-2.5 text-sm text-success">You&apos;re all caught up.</p>
          ) : (
            <ul className="mt-3 grid gap-2">
              {attention.slice(0, 6).map((lead) => {
                const c = contactSummary(lead);
                return (
                  <li key={lead.id}>
                    <Link href={`/crm/leads/${lead.id}`} className="flex items-center justify-between gap-2 rounded-[var(--radius-sm)] px-2 py-2 hover:bg-surface">
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-ink">{c.name}</span>
                        <span className="block truncate text-xs text-muted">{LEAD_LABELS[lead.type]}</span>
                      </span>
                      <span className="shrink-0 text-xs font-medium text-warning">{relativeTime(lead.createdAt)}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Where leads come from */}
        <section aria-labelledby="sources-heading" className="rounded-[var(--radius-md)] border border-line bg-white p-5">
          <h2 id="sources-heading" className="font-display text-lg font-bold text-ink">
            Where leads come from
          </h2>
          {sources.length === 0 ? (
            <p className="mt-3 text-sm text-slate">No leads yet.</p>
          ) : (
            <ul className="mt-4 grid gap-3">
              {sources.map((s) => {
                const Icon = TYPE_ICONS[s.type];
                return (
                  <li key={s.type} className="grid gap-1">
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="flex min-w-0 items-center gap-2 font-medium text-ink">
                        <Icon className="size-4 shrink-0 text-navy-700" aria-hidden />
                        <span className="truncate">{LEAD_LABELS[s.type]}</span>
                      </span>
                      <span className="tabular text-muted">{s.count}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-surface">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${(s.count / maxSource) * 100}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Recent activity */}
        <section aria-labelledby="recent-heading" className="rounded-[var(--radius-md)] border border-line bg-white p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 id="recent-heading" className="font-display text-lg font-bold text-ink">
              Recent leads
            </h2>
            <Link href="/crm/leads" className="inline-flex items-center gap-1 text-sm font-semibold text-navy-700 hover:underline">
              View all <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="mt-3 text-sm text-slate">No leads yet. They&apos;ll show up here as soon as someone submits a form.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {recent.map((lead) => {
                const c = contactSummary(lead);
                const Icon = TYPE_ICONS[lead.type];
                return (
                  <li key={lead.id}>
                    <Link href={`/crm/leads/${lead.id}`} className="flex items-center gap-3 py-2.5 hover:bg-surface">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-navy-100 text-navy-900">
                        <Icon className="size-4" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-ink">{c.name}</span>
                        <span className="block truncate text-xs text-muted">
                          {LEAD_LABELS[lead.type]} · {relativeTime(lead.createdAt)}
                        </span>
                      </span>
                      <span className="hidden shrink-0 items-center gap-2 text-muted sm:flex">
                        {c.phone && <Phone className="size-3.5" aria-hidden />}
                        {c.email && <Mail className="size-3.5" aria-hidden />}
                      </span>
                      <StatusBadge status={lead.status} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <p className="text-xs text-muted">Status breakdown: {(Object.keys(STATUS_LABELS) as (keyof typeof STATUS_LABELS)[]).map((s) => `${STATUS_LABELS[s]} ${counts.byStatus[s]}`).join(" · ")}</p>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  trend,
  trendTone,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  hint?: string;
  trend?: string;
  trendTone?: "success" | "warning";
  tone?: "warning";
}) {
  return (
    <div className="rounded-[var(--radius-md)] border border-line bg-white p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
        <Icon className="size-3.5" aria-hidden /> {label}
      </div>
      <div className={`mt-1.5 font-display text-2xl font-bold tabular ${tone === "warning" && Number(value) > 0 ? "text-warning" : "text-ink"}`}>{value}</div>
      {trend && <p className={`mt-0.5 text-xs font-medium ${trendTone === "success" ? "text-success" : "text-warning"}`}>{trend}</p>}
      {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}
