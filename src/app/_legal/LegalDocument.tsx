import { Fragment, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { PageHero, Section } from "@/components/ui/Section";
import { TodoFlag } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";

/**
 * Shared layout for the Privacy Policy and Terms of Use (private folder — not a route).
 * One `sections` array drives both the table of contents and the body, so they never drift apart.
 */
export interface LegalSection {
  id: string;
  title: string;
  content: ReactNode;
}

export function LegalDocument({
  title,
  path,
  intro,
  lastUpdated,
  lastUpdatedIso,
  sections,
}: {
  title: string;
  path: string;
  intro: ReactNode;
  lastUpdated: string;
  lastUpdatedIso: string;
  sections: LegalSection[];
}) {
  const tocLinks = (
    <ol className="text-sm lg:border-l lg:border-line">
      {sections.map((s, i) => (
        <li key={s.id}>
          <a
            href={`#${s.id}`}
            className="flex min-h-11 items-center gap-2 py-1 text-slate hover:text-ink lg:-ml-px lg:border-l-2 lg:border-transparent lg:pl-4 lg:hover:border-ink"
          >
            <span className="tabular w-5 shrink-0 text-muted">{i + 1}.</span>
            {s.title}
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <>
      <PageHero breadcrumbs={<Breadcrumbs tone="dark" items={[{ name: title, path }]} />} eyebrow="Legal" title={title} intro={intro}>
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-white/80">
            Last updated <time dateTime={lastUpdatedIso}>{lastUpdated}</time>
          </p>
          <TodoFlag>Legal review required before publishing.</TodoFlag>
        </div>
      </PageHero>

      <Section>
        <div className="grid gap-10 lg:grid-cols-12">
          <nav aria-label="On this page" className="lg:col-span-4 xl:col-span-3">
            {/* Mobile: collapsible contents */}
            <details className="group rounded-[var(--radius-md)] border border-line lg:hidden">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-semibold text-ink [&::-webkit-details-marker]:hidden">
                On this page
                <ChevronDown className="size-5 text-muted transition-transform duration-200 group-open:rotate-180" aria-hidden />
              </summary>
              <div className="border-t border-line px-4 py-2">{tocLinks}</div>
            </details>
            {/* Desktop: sticky contents */}
            <div className="hidden lg:sticky lg:top-28 lg:block">
              <p className="eyebrow mb-3">On this page</p>
              {tocLinks}
            </div>
          </nav>

          {/* Headings and content are direct children of .prose-page so its vertical rhythm applies. */}
          <div className="prose-page max-w-3xl lg:col-span-8 xl:col-span-9">
            {sections.map((s, i) => (
              <Fragment key={s.id}>
                <h2 id={s.id} className={i === 0 ? "mt-0" : undefined}>
                  {i + 1}. {s.title}
                </h2>
                {s.content}
              </Fragment>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}
