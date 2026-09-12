import Image from "next/image";
import Link from "next/link";
import { Users, Clock, TrendingUp, ArrowRight, ArrowUpRight, CheckCircle2, Phone, Mail, CalendarDays, History, Globe } from "lucide-react";
import { listLeads, summarize, typeBreakdown, needsAttention, dailyCounts, responseRate, weeklyTrend, thisMonthCount, monthlyHistory } from "@/lib/crm/leads";
import { getPageviewStats } from "@/lib/pageviews/stats";
import { LEAD_LABELS, STATUS_LABELS, contactSummary, relativeTime } from "@/lib/crm/format";
import { TYPE_ICONS } from "@/lib/crm/icons";
import { vehiclePhotosForLeads } from "@/lib/crm/vehicle-photos";
import { StatusBadge } from "./StatusSelect";
import { LeadsTrendChart } from "./Sparkline";
import { Gauge, gaugeScale } from "./Gauge";

/** "/inventory/2021-honda-civic-abc123" -> "Inventory". "/" -> "Home". Falls back to the raw path. */
function friendlyPath(pathname: string): string {
  if (pathname === "/") return "Home";
  const first = pathname.split("/").filter(Boolean)[0] ?? "";
  if (!first) return pathname;
  return first.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export const metadata = { title: "Overview", robots: { index: false, follow: false } };

const CARD =
  "rounded-[20px] border border-white/10 bg-[#161616] p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_12px_28px_-14px_rgba(0,0,0,0.7)]";
const ARROW_BTN =
  "inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/50 transition-colors hover:border-lime-400/40 hover:text-lime-300";

export default async function CrmOverviewPage() {
  const leads = await listLeads();
  const pageviews = await getPageviewStats();
  const counts = summarize(leads);
  const sources = typeBreakdown(leads);
  const attention = needsAttention(leads, 24);
  const trend = dailyCounts(leads, 14);
  const rate = responseRate(leads);
  const { last7, deltaPct: trendDelta } = weeklyTrend(leads);
  const thisMonth = thisMonthCount(leads);
  const history = monthlyHistory(leads);
  const recent = leads.slice(0, 6);
  const vehiclePhotos = await vehiclePhotosForLeads(recent);
  const maxSource = Math.max(1, ...sources.map((s) => s.count));
  const maxMonth = Math.max(1, ...history.map((m) => m.count));

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Overview</h1>
        <p className="mt-1 text-sm text-white/50">A snapshot of every lead coming through the website.</p>
      </div>

      {/* Headline stats — three dials, mirroring a speedometer-style dashboard read */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className={`${CARD} flex flex-col items-center`}>
          <div className="flex w-full items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/50">
              <Users className="size-3.5" aria-hidden /> Total leads
            </span>
            <Link href="/crm/leads" className={ARROW_BTN} aria-label="Go to all leads">
              <ArrowUpRight className="size-4" aria-hidden />
            </Link>
          </div>
          <div className="mt-2">
            <Gauge value={counts.total} max={gaugeScale(counts.total)} display={String(counts.total)} />
          </div>
        </div>
        <div className={`${CARD} flex flex-col items-center`}>
          <div className="flex w-full items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/50">
              <CalendarDays className="size-3.5" aria-hidden /> This month
            </span>
            {history[0] && (
              <Link href={`/crm/leads?month=${history[0].key}`} className={ARROW_BTN} aria-label="Go to this month's leads">
                <ArrowUpRight className="size-4" aria-hidden />
              </Link>
            )}
          </div>
          <div className="mt-2">
            <Gauge value={thisMonth} max={gaugeScale(thisMonth)} display={String(thisMonth)} sublabel={history[0]?.label} />
          </div>
        </div>
        <div className={`${CARD} flex flex-col items-center`}>
          <div className="flex w-full items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/50">
              <CheckCircle2 className="size-3.5" aria-hidden /> Response rate
            </span>
            <Link href="/crm/leads" className={ARROW_BTN} aria-label="Go to all leads">
              <ArrowUpRight className="size-4" aria-hidden />
            </Link>
          </div>
          <div className="mt-2">
            <Gauge value={rate ?? 0} max={100} display={rate == null ? "—" : `${rate}%`} sublabel="Not new or spam" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={TrendingUp}
          label="Last 7 days"
          value={last7}
          trend={trendDelta == null ? undefined : `${trendDelta >= 0 ? "+" : ""}${trendDelta}% vs. prior week`}
          trendTone={trendDelta == null ? undefined : trendDelta >= 0 ? "success" : "warning"}
        />
        <StatCard icon={Clock} label="Needs attention" value={attention.length} tone={attention.length > 0 ? "warning" : undefined} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Trend chart */}
        <section aria-labelledby="trend-heading" className={`${CARD} lg:col-span-2`}>
          <div className="flex items-center justify-between">
            <h2 id="trend-heading" className="font-display text-lg font-bold text-white">
              Leads, last 14 days
            </h2>
            <span className="text-sm text-white/50 tabular">{trend.reduce((n, d) => n + d.count, 0)} total</span>
          </div>
          <div className="mt-4">
            <LeadsTrendChart data={trend} />
          </div>
        </section>

        {/* Needs attention */}
        <section aria-labelledby="attention-heading" className={CARD}>
          <h2 id="attention-heading" className="font-display text-lg font-bold text-white">
            Needs attention
          </h2>
          <p className="mt-0.5 text-xs text-white/50">New leads sitting more than 24 hours</p>
          {attention.length === 0 ? (
            <p className="mt-4 rounded-[var(--radius-sm)] bg-success-soft px-3 py-2.5 text-sm text-success">You&apos;re all caught up.</p>
          ) : (
            <ul className="mt-3 grid gap-2">
              {attention.slice(0, 6).map((lead) => {
                const c = contactSummary(lead);
                return (
                  <li key={lead.id}>
                    <Link href={`/crm/leads/${lead.id}`} className="flex items-center justify-between gap-2 rounded-[var(--radius-sm)] px-2 py-2 hover:bg-white/5">
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-white">{c.name}</span>
                        <span className="block truncate text-xs text-white/50">{LEAD_LABELS[lead.type]}</span>
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

      {/* Website traffic */}
      <div>
        <div className="flex items-center gap-1.5">
          <Globe className="size-4 text-lime-300" aria-hidden />
          <h2 className="font-display text-lg font-bold text-white">Website traffic</h2>
        </div>
        <p className="mt-0.5 text-xs text-white/50">How many people are visiting autoselectgroups.com.</p>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard icon={CalendarDays} label="Visits today" value={pageviews.today} />
          <StatCard
            icon={TrendingUp}
            label="Visits, last 7 days"
            value={pageviews.last7}
            trend={pageviews.deltaPct == null ? undefined : `${pageviews.deltaPct >= 0 ? "+" : ""}${pageviews.deltaPct}% vs. prior week`}
            trendTone={pageviews.deltaPct == null ? undefined : pageviews.deltaPct >= 0 ? "success" : "warning"}
          />
          <StatCard icon={Users} label="Visits this month" value={pageviews.thisMonth} />
        </div>
        <div className="mt-3 grid gap-6 lg:grid-cols-3">
          <section aria-labelledby="traffic-trend-heading" className={`${CARD} lg:col-span-2`}>
            <div className="flex items-center justify-between">
              <h3 id="traffic-trend-heading" className="font-display text-lg font-bold text-white">
                Visits, last 14 days
              </h3>
              <span className="text-sm text-white/50 tabular">{pageviews.total} all-time</span>
            </div>
            <div className="mt-4">
              <LeadsTrendChart data={pageviews.daily} color="#a3e635" unit="Visits" />
            </div>
          </section>
          <section aria-labelledby="top-pages-heading" className={CARD}>
            <h3 id="top-pages-heading" className="font-display text-lg font-bold text-white">
              Top pages
            </h3>
            {pageviews.topPaths.length === 0 ? (
              <p className="mt-3 text-sm text-white/50">No visits recorded yet.</p>
            ) : (
              <ul className="mt-4 grid gap-3">
                {pageviews.topPaths.map((p) => {
                  const maxPath = Math.max(1, ...pageviews.topPaths.map((x) => x.count));
                  return (
                    <li key={p.path} className="grid gap-1">
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <span className="truncate font-medium text-white/80">{friendlyPath(p.path)}</span>
                        <span className="tabular text-white/50">{p.count}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full rounded-full bg-lime-400" style={{ width: `${(p.count / maxPath) * 100}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Where leads come from */}
        <section aria-labelledby="sources-heading" className={CARD}>
          <h2 id="sources-heading" className="font-display text-lg font-bold text-white">
            Where leads come from
          </h2>
          {sources.length === 0 ? (
            <p className="mt-3 text-sm text-white/50">No leads yet.</p>
          ) : (
            <ul className="mt-4 grid gap-3">
              {sources.map((s) => {
                const Icon = TYPE_ICONS[s.type];
                return (
                  <li key={s.type} className="grid gap-1">
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="flex min-w-0 items-center gap-2 font-medium text-white/80">
                        <Icon className="size-4 shrink-0 text-lime-300" aria-hidden />
                        <span className="truncate">{LEAD_LABELS[s.type]}</span>
                      </span>
                      <span className="tabular text-white/50">{s.count}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-lime-400" style={{ width: `${(s.count / maxSource) * 100}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Recent activity */}
        <section aria-labelledby="recent-heading" className={`${CARD} lg:col-span-2`}>
          <div className="flex items-center justify-between">
            <h2 id="recent-heading" className="font-display text-lg font-bold text-white">
              Recent leads
            </h2>
            <Link href="/crm/leads" className="inline-flex items-center gap-1 text-sm font-semibold text-lime-300 hover:underline">
              View all <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="mt-3 text-sm text-white/50">No leads yet. They&apos;ll show up here as soon as someone submits a form.</p>
          ) : (
            <ul className="mt-3 divide-y divide-white/10">
              {recent.map((lead) => {
                const c = contactSummary(lead);
                const Icon = TYPE_ICONS[lead.type];
                const photo = lead.vehicleId ? vehiclePhotos[lead.vehicleId] : undefined;
                return (
                  <li key={lead.id}>
                    <Link href={`/crm/leads/${lead.id}`} className="flex items-center gap-4 rounded-[var(--radius-md)] py-3 hover:bg-white/5">
                      {photo ? (
                        <Image src={photo.url} alt={photo.alt} width={160} height={120} className="size-20 shrink-0 rounded-[var(--radius-md)] border border-white/10 object-cover" />
                      ) : (
                        <span className="flex size-20 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-white/10 text-white/50">
                          <Icon className="size-7" aria-hidden />
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-lg font-bold text-white">{c.name}</span>
                        <span className="block truncate text-sm text-white/50">
                          {LEAD_LABELS[lead.type]} · {relativeTime(lead.createdAt)}
                        </span>
                        {photo?.name && <span className="mt-0.5 block truncate text-sm font-semibold text-lime-300">{photo.name}</span>}
                      </span>
                      <span className="hidden shrink-0 items-center gap-3 text-white/40 sm:flex">
                        {c.phone && <Phone className="size-4" aria-hidden />}
                        {c.email && <Mail className="size-4" aria-hidden />}
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

      {/* Monthly history */}
      <section aria-labelledby="history-heading" className={CARD}>
        <div className="flex items-center gap-1.5">
          <History className="size-4 text-lime-300" aria-hidden />
          <h2 id="history-heading" className="font-display text-lg font-bold text-white">
            Leads by month
          </h2>
        </div>
        <p className="mt-0.5 text-xs text-white/50">Every month is kept on record — pick one to see just those leads.</p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {history.map((m) => (
            <li key={m.key}>
              <Link
                href={`/crm/leads?month=${m.key}`}
                className="flex items-center justify-between gap-3 rounded-[var(--radius-sm)] border border-white/10 px-3 py-2.5 text-sm hover:border-white/25 hover:bg-white/5"
              >
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-white">{m.label}</span>
                  <span className="mt-1 block h-1 w-full overflow-hidden rounded-full bg-white/10">
                    <span className="block h-full rounded-full bg-lime-400" style={{ width: `${(m.count / maxMonth) * 100}%` }} />
                  </span>
                </span>
                <span className="shrink-0 tabular font-semibold text-white">{m.count}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-xs text-white/40">Status breakdown: {(Object.keys(STATUS_LABELS) as (keyof typeof STATUS_LABELS)[]).map((s) => `${STATUS_LABELS[s]} ${counts.byStatus[s]}`).join(" · ")}</p>
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
    <div className="rounded-[20px] border border-white/10 bg-[#161616] p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_12px_28px_-14px_rgba(0,0,0,0.7)] transition-[border-color] duration-200 hover:border-white/20">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/50">
        <Icon className="size-3.5" aria-hidden /> {label}
      </div>
      <div className={`mt-2 font-display text-3xl font-bold tabular ${tone === "warning" && Number(value) > 0 ? "text-warning" : "text-white"}`}>{value}</div>
      {trend && <p className={`mt-0.5 text-xs font-medium ${trendTone === "success" ? "text-success" : "text-warning"}`}>{trend}</p>}
      {hint && <p className="mt-0.5 text-xs text-white/40">{hint}</p>}
    </div>
  );
}
