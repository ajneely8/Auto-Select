import Link from "next/link";
import { ArrowRight, ExternalLink, Quote, Star } from "lucide-react";
import { business } from "@/config/business";
import { pageMetadata } from "@/lib/seo";
import { PageHero, Section } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { TodoFlag } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { reviews } from "@/content/reviews";

export const metadata = pageMetadata({
  title: "Customer Reviews",
  description: "Read what customers have shared about buying a vehicle with Auto Select, a family-owned online dealership in Live Oak, Texas.",
  path: "/reviews",
});

export default function ReviewsPage() {
  return (
    <>
      <PageHero
        breadcrumbs={<Breadcrumbs tone="dark" items={[{ name: "Reviews", path: "/reviews" }]} />}
        eyebrow="Customer reviews"
        title="What our customers say"
        intro="Feedback customers have shared about buying with Auto Select."
      />

      <Section labelledBy="reviews-heading">
        <h2 id="reviews-heading" className="sr-only">
          Customer reviews
        </h2>
        <ul className="grid gap-6 lg:grid-cols-2">
          {reviews.map((r) => (
            <li key={r.id} data-reveal>
              <figure className="flex h-full flex-col rounded-[var(--radius-md)] border border-line bg-white p-6 sm:p-8">
                {r.rating ? (
                  <div className="flex items-center gap-0.5" aria-label={`${r.rating} out of 5 stars`}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} className={`size-4 ${i < r.rating! ? "fill-accent text-accent-text" : "text-line-strong"}`} aria-hidden />
                    ))}
                  </div>
                ) : (
                  <Quote className="size-8 text-navy-700" aria-hidden />
                )}
                <blockquote className="mt-4 flex-1 text-lg leading-relaxed text-ink">
                  <p>{r.body}</p>
                </blockquote>
                <figcaption className="mt-6 border-t border-line pt-4">
                  <span className="block font-display text-lg font-bold text-ink">{r.author}</span>
                  <span className="block text-sm text-muted">Shared on {r.source}</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-muted">Reviews are shown as originally shared, with minor spelling and punctuation corrections.</p>
      </Section>

      <Section tone="surface" labelledBy="share-heading">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-center" data-reveal>
          <div className="lg:col-span-7">
            <h2 id="share-heading" className="text-3xl font-bold leading-tight">
              Bought from us? We&apos;d like to hear how it went.
            </h2>
            <p className="mt-3 text-[1.0625rem] leading-relaxed text-slate">
              Whether you purchased a vehicle, traded one in, or used one of our automotive services, your feedback helps other drivers — and helps us improve.
            </p>
            <div className="mt-5">
              <TodoFlag>Add links to verified review profiles (Google Business Profile, etc.) once confirmed.</TodoFlag>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:col-span-5 lg:flex-col lg:items-stretch">
            <ButtonLink href={business.social.facebook} external variant="secondary" size="lg" className="whitespace-normal! py-2 text-center">
              Share your experience on Facebook
              <ExternalLink className="size-4" aria-hidden />
              <span className="sr-only">(opens in new tab)</span>
            </ButtonLink>
            <ButtonLink href="/contact" variant="outline" size="lg">
              Send us feedback directly
            </ButtonLink>
          </div>
        </div>
      </Section>

      <Section labelledBy="reviews-cta-heading">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between" data-reveal>
          <div>
            <h2 id="reviews-cta-heading" className="text-2xl font-bold">
              Ready to start your own search?
            </h2>
            <p className="mt-1 text-slate">Browse our current vehicles or learn more about the team.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ButtonLink href="/inventory" size="lg">
              Browse inventory
            </ButtonLink>
            <Link href="/about" className="inline-flex min-h-11 items-center gap-1.5 px-2 font-semibold text-navy-700 underline-offset-2 hover:underline">
              Meet the team <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
