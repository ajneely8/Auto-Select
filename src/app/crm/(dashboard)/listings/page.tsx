import { getListingPerformance } from "@/lib/crm/listings";
import { ListingsClient } from "./ListingsClient";

export const metadata = { title: "Listing Performance", robots: { index: false, follow: false } };

const isDay = (v: unknown): v is string => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);

export default async function ListingPerformancePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const from = isDay(sp.from) ? sp.from : undefined;
  const to = isDay(sp.to) ? sp.to : undefined;
  const data = await getListingPerformance({ from, to });

  return <ListingsClient data={data} />;
}
