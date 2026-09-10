import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { business } from "@/config/business";
import { articleJsonLd, pageMetadata } from "@/lib/seo";
import { PageHero, Section } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { formatPostDate, getPost, getRelatedPosts, headingId, posts, type BlogBlock, type BlogCategory } from "@/content/blog";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Guide not found", robots: { index: false, follow: true } };
  return pageMetadata({ title: post.title, description: post.description, path: `/blog/${post.slug}`, type: "article" });
}

interface Cta {
  title: string;
  text: string;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string; external?: boolean };
  note?: string;
}

const categoryCta: Record<BlogCategory, Cta> = {
  Financing: {
    title: "Ready to see your financing options?",
    text: "Learn how financing works at Auto Select, or start the secure application when you're ready.",
    primary: { href: "/financing", label: "Explore financing" },
    secondary: { href: business.financing.applicationUrl, label: "Start secure application", external: true },
    note: business.financing.disclosure,
  },
  "Test Drives": {
    title: "Schedule a test drive",
    text: "Choose a time that works for you. A team member will contact you to confirm your appointment.",
    primary: { href: "/schedule", label: "Request a test drive" },
    secondary: { href: "/inventory", label: "Browse inventory" },
  },
  "Trade-Ins": {
    title: "Get a trade-in estimate",
    text: "Share your vehicle's details and photos, and we'll follow up with a preliminary estimate.",
    primary: { href: "/trade-in", label: "Value your trade" },
    note: "Online estimates are preliminary and subject to an in-person inspection.",
  },
  Delivery: {
    title: "Ask about delivery",
    text: "Tell us where you'd like your vehicle delivered. We'll confirm availability, timing, and any fees.",
    primary: { href: "/delivery", label: "Request delivery" },
  },
  "Service Contracts": {
    title: "Questions about coverage?",
    text: "Ask about optional service contracts for your vehicle. They're never required to buy.",
    primary: { href: "/service-contracts", label: "Explore service contracts" },
  },
  "Vehicle Locating": {
    title: "Tell us what you're looking for",
    text: "Send a Find a Vehicle request, and our team will start searching.",
    primary: { href: "/find-a-vehicle", label: "Find a vehicle" },
    secondary: { href: "/inventory", label: "Browse inventory" },
  },
  "Buying Guide": {
    title: "Start with our inventory",
    text: "Browse our current vehicles, or ask us to help you find the right one.",
    primary: { href: "/inventory", label: "Browse inventory" },
    secondary: { href: "/find-a-vehicle", label: "Find a vehicle" },
  },
};

/** Bold a short "Label:" lead-in on list items (e.g. "Braking: Does the vehicle…"). */
function ListItemText({ text }: { text: string }) {
  const m = /^([A-Z][A-Za-z0-9 ()/&'-]{1,40}):\s(.+)$/.exec(text);
  if (!m) return <>{text}</>;
  return (
    <>
      <strong>{m[1]}:</strong> {m[2]}
    </>
  );
}

function Block({ block }: { block: BlogBlock }) {
  switch (block.type) {
    case "h2":
      return <h2 id={headingId(block.text)}>{block.text}</h2>;
    case "h3":
      return <h3>{block.text}</h3>;
    case "p":
      return <p>{block.text}</p>;
    case "ul":
      return (
        <ul>
          {block.items.map((item) => (
            <li key={item}>
              <ListItemText text={item} />
            </li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol>
          {block.items.map((item) => (
            <li key={item}>
              <ListItemText text={item} />
            </li>
          ))}
        </ol>
      );
    case "callout":
      return (
        <div role="note" className="rounded-[var(--radius-sm)] border-l-4 border-navy-700 bg-surface px-5 py-4 text-[1rem] text-ink">
          <p>{block.text}</p>
        </div>
      );
  }
}

export default async function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const path = `/blog/${post.slug}`;
  const toc = post.body.filter((b): b is { type: "h2"; text: string } => b.type === "h2");
  const cta = categoryCta[post.category];
  const related = getRelatedPosts(post.slug, 3);

  return (
    <>
      <PageHero
        breadcrumbs={
          <Breadcrumbs
            tone="dark"
            items={[
              { name: "Car-Buying Guides", path: "/blog" },
              { name: post.title, path },
            ]}
          />
        }
        eyebrow={post.category}
        title={post.title}
        intro={post.description}
      >
        <p className="text-sm text-white/75">
          By {business.name}
          <span aria-hidden> · </span>
          <time dateTime={post.datePublished}>{formatPostDate(post.datePublished)}</time>
          <span aria-hidden> · </span>
          {post.readingMinutes} min read
        </p>
      </PageHero>

      <Section>
        <div className="grid gap-12 lg:grid-cols-12">
          <article className="lg:col-span-8">
            <div className="prose-page max-w-3xl">
              {post.body.map((block, i) => (
                <Block key={i} block={block} />
              ))}
            </div>
            <div className="mt-10 max-w-3xl border-t border-line pt-6">
              <Link href="/blog" className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-navy-700 underline-offset-2 hover:underline">
                <ArrowLeft className="size-4" aria-hidden /> All car-buying guides
              </Link>
            </div>
          </article>

          <aside className="lg:col-span-4" aria-label="Guide tools">
            <div className="flex flex-col gap-6 lg:sticky lg:top-28">
              {toc.length > 2 && (
                <nav aria-label="In this guide" className="hidden lg:block">
                  <p className="eyebrow mb-3">In this guide</p>
                  <ol className="border-l border-line text-sm">
                    {toc.map((h) => (
                      <li key={h.text}>
                        <a
                          href={`#${headingId(h.text)}`}
                          className="-ml-px flex min-h-11 items-center border-l-2 border-transparent py-1 pl-4 text-slate hover:border-ink hover:text-ink"
                        >
                          {h.text}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              )}

              <div className="rounded-[var(--radius-md)] border border-line bg-surface p-6">
                <h2 className="text-xl font-bold leading-tight">{cta.title}</h2>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-slate">{cta.text}</p>
                <div className="mt-5 flex flex-col gap-2.5">
                  <ButtonLink href={cta.primary.href} size="lg">
                    {cta.primary.label}
                  </ButtonLink>
                  {cta.secondary &&
                    (cta.secondary.external ? (
                      <ButtonLink href={cta.secondary.href} external variant="outline" size="lg">
                        {cta.secondary.label}
                        <ExternalLink className="size-4" aria-hidden />
                        <span className="sr-only">(opens in new tab)</span>
                      </ButtonLink>
                    ) : (
                      <ButtonLink href={cta.secondary.href} variant="outline" size="lg">
                        {cta.secondary.label}
                      </ButtonLink>
                    ))}
                </div>
                {cta.note && <p className="mt-4 text-xs leading-relaxed text-muted">{cta.note}</p>}
              </div>
            </div>
          </aside>
        </div>
      </Section>

      {related.length > 0 && (
        <Section tone="surface" labelledBy="related-heading">
          <h2 id="related-heading" className="text-2xl font-bold sm:text-3xl">
            Related guides
          </h2>
          <ul className="mt-6 grid gap-5 md:grid-cols-3">
            {related.map((p) => (
              <li key={p.slug} data-reveal>
                <article className="group relative flex h-full flex-col rounded-[var(--radius-md)] border border-line bg-white p-5 transition-colors hover:border-ink">
                  <Badge className="self-start">{p.category}</Badge>
                  <h3 className="mt-3 text-lg font-bold leading-snug text-ink">
                    <Link href={`/blog/${p.slug}`} className="after:absolute after:inset-0 after:content-[''] group-hover:underline underline-offset-4">
                      {p.title}
                    </Link>
                  </h3>
                  <p className="mt-2 flex-1 text-[0.9375rem] leading-relaxed text-slate">{p.description}</p>
                  <span aria-hidden className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-700">
                    {p.readingMinutes} min read <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </article>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <JsonLd data={articleJsonLd({ title: post.title, description: post.description, path, datePublished: post.datePublished })} />
    </>
  );
}
