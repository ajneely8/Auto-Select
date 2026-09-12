import { listLeads, monthlyHistory } from "@/lib/crm/leads";
import { LEAD_LABELS } from "@/lib/crm/format";
import { vehiclePhotosForLeads } from "@/lib/crm/vehicle-photos";
import { LeadsTable } from "../LeadsTable";

export const metadata = { title: "Leads", robots: { index: false, follow: false } };

export default async function CrmLeadsPage({ searchParams }: PageProps<"/crm/leads">) {
  const [leads, sp] = await Promise.all([listLeads(), searchParams]);
  const [months, vehiclePhotos] = await Promise.all([monthlyHistory(leads), vehiclePhotosForLeads(leads)]);
  const monthParam = typeof sp.month === "string" ? sp.month : undefined;
  const initialMonth = monthParam && months.some((m) => m.key === monthParam) ? monthParam : "";

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">All leads</h1>
        <p className="mt-1 text-sm text-white/50">Every inventory, financing, trade-in, delivery, service, and contact form submitted on the website.</p>
      </div>
      <LeadsTable leads={leads} typeLabels={LEAD_LABELS} months={months} initialMonth={initialMonth} vehiclePhotos={vehiclePhotos} />
    </div>
  );
}
