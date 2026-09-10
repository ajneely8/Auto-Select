import { listLeads, summarize } from "@/lib/crm/leads";
import { LEAD_LABELS, STATUS_LABELS } from "@/lib/crm/format";
import { LeadsTable } from "./LeadsTable";

export const metadata = { title: "Leads", robots: { index: false, follow: false } };

export default async function CrmHomePage() {
  const leads = await listLeads();
  const counts = summarize(leads);

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Leads</h1>
        <p className="mt-1 text-sm text-slate">Every inventory, financing, trade-in, delivery, service, and contact form submitted on the website.</p>
      </div>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-[var(--radius-md)] border border-line bg-white p-4">
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Total</dt>
          <dd className="mt-1 font-display text-2xl font-bold tabular text-ink">{counts.total}</dd>
        </div>
        {(["new", "contacted", "qualified", "closed", "spam"] as const).map((s) => (
          <div key={s} className="rounded-[var(--radius-md)] border border-line bg-white p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{STATUS_LABELS[s]}</dt>
            <dd className="mt-1 font-display text-2xl font-bold tabular text-ink">{counts.byStatus[s]}</dd>
          </div>
        ))}
      </dl>

      <LeadsTable leads={leads} typeLabels={LEAD_LABELS} />
    </div>
  );
}
