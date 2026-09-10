import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { SavedList } from "@/components/shopping/SavedList";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Saved Vehicles & Searches",
  description: "Vehicles and searches you've saved at Auto Select.",
  path: "/saved",
  noindex: true,
});

export default function SavedPage() {
  return (
    <div className="bg-surface">
      <div className="container-page py-8 sm:py-10">
        <Breadcrumbs items={[{ name: "Saved", path: "/saved" }]} />
        <h1 className="mb-2 font-display text-3xl font-bold sm:text-4xl">Saved vehicles &amp; searches</h1>
        <p className="mb-8 max-w-2xl text-slate">These are stored in this browser only. Clearing your browser data removes them.</p>
        <SavedList />
      </div>
    </div>
  );
}
