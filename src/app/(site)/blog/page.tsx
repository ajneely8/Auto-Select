import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { pageMetadata } from "@/lib/seo";
import { PageHero, Section } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { formatPostDate, posts } from "@/content/blog";

export const metadata = pageMetadata({
  title: "Car-Buying Guides",
  description:
    "Practical guides from Auto Select in Live Oak, TX: how auto financing works, test-drive checklists, trade-in estimates, delivery, service contracts, and buying a used car in San Antonio.",
  path: "/blog",
});

export default function BlogIndexPage() {
  return (
    <>
      <PageHero
        breadcrumbs={<Breadcrumbs tone="dark" items={[{ name: "Car-Buying Guides", path: "/blog" }]} />}
        eyebrow="Guides"
        title="Car-Buying Guides"
        intro="Plain-English answers to the questions that come up when you buy, finance, or trade in a vehicle."
      />

      <Section labelledBy="guides-heading">
        <h2 id="guides-heading" className="sr-only">
          All guides
        </h2>
        <ul className="grid gap-5 md:grid-cols-2">
          {posts.map((p, i) => (
            <li key={p.slug} data-reveal className={i === 0 ? "md:col-span-2" : ""}>
              <article className="group relative flex h-full flex-col rounded-[var(--radius-md)] border border-line bg-white p-6 transition-colors hover:border-ink sm:p-7">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted">
                  <Badge>{p.category}</Badge>
                  <span>
                    <time dateTime={p.datePublished}>{formatPostDate(p.datePublished)}</time>
                    <span aria-hidden> · </span>
                    {p.readingMinutes} min read
                  </span>
                </div>
                <h3 className={`mt-4 font-bold leading-tight text-ink ${i === 0 ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"}`}>
                  <Link href={`/blog/${p.slug}`} className="after:absolute after:inset-0 after:content-[''] group-hover:underline underline-offset-4 decoration-2">
                    {p.title}
                  </Link>
                </h3>
                <p className={`mt-2 flex-1 leading-relaxed text-slate ${i === 0 ? "max-w-3xl text-[1.0625rem]" : ""}`}>{p.description}</p>
                <span aria-hidden className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-700">
                  Read the guide <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </article>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
