import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/site";
import { getPublishedVehicles } from "@/lib/inventory/repository";
import { posts } from "@/content/blog";

/** Rebuilt on each deploy and whenever inventory revalidates; sold vehicles drop out automatically. */
export const revalidate = 900;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "/", priority: 1, changeFrequency: "daily" },
    { path: "/inventory", priority: 0.9, changeFrequency: "daily" },
    { path: "/financing", priority: 0.8, changeFrequency: "monthly" },
    { path: "/trade-in", priority: 0.8, changeFrequency: "monthly" },
    { path: "/find-a-vehicle", priority: 0.8, changeFrequency: "monthly" },
    { path: "/delivery", priority: 0.6, changeFrequency: "monthly" },
    { path: "/service-contracts", priority: 0.6, changeFrequency: "monthly" },
    { path: "/services", priority: 0.6, changeFrequency: "monthly" },
    { path: "/about", priority: 0.5, changeFrequency: "yearly" },
    { path: "/reviews", priority: 0.5, changeFrequency: "monthly" },
    { path: "/faq", priority: 0.5, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.7, changeFrequency: "yearly" },
    { path: "/schedule", priority: 0.6, changeFrequency: "yearly" },
    { path: "/blog", priority: 0.5, changeFrequency: "weekly" },
    { path: "/privacy-policy", priority: 0.2, changeFrequency: "yearly" },
    { path: "/terms-of-use", priority: 0.2, changeFrequency: "yearly" },
  ];
  const vehicles = await getPublishedVehicles();
  return [
    ...staticRoutes.map((r) => ({ url: `${siteUrl}${r.path}`, changeFrequency: r.changeFrequency, priority: r.priority })),
    ...vehicles.map((v) => ({
      url: `${siteUrl}/inventory/${v.slug}`,
      lastModified: new Date(v.dateAdded),
      changeFrequency: "daily" as const,
      priority: 0.8,
      images: v.photos.slice(0, 5).map((p) => p.url),
    })),
    ...posts.map((p) => ({ url: `${siteUrl}/blog/${p.slug}`, lastModified: new Date(p.datePublished), changeFrequency: "yearly" as const, priority: 0.4 })),
  ];
}
