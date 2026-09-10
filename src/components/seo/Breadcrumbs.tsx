import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLd } from "./JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo";

/** Visible breadcrumbs + matching BreadcrumbList schema. The last item is the current page. */
export function Breadcrumbs({ items, tone = "light" }: { items: { name: string; path: string }[]; tone?: "light" | "dark" }) {
  const all = [{ name: "Home", path: "/" }, ...items];
  const color = tone === "dark" ? "text-white/70 hover:text-white" : "text-muted hover:text-ink";
  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-4 text-sm">
        <ol className="flex flex-wrap items-center gap-1">
          {all.map((it, i) => {
            const last = i === all.length - 1;
            return (
              <li key={it.path} className="inline-flex items-center gap-1">
                {last ? (
                  <span aria-current="page" className={tone === "dark" ? "text-white" : "text-ink font-medium"}>
                    {it.name}
                  </span>
                ) : (
                  <>
                    <Link href={it.path} className={`${color} underline-offset-2 hover:underline`}>
                      {it.name}
                    </Link>
                    <ChevronRight className={`size-3.5 ${tone === "dark" ? "text-white/40" : "text-line-strong"}`} aria-hidden />
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd data={breadcrumbJsonLd(all)} />
    </>
  );
}
