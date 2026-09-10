import { business } from "@/config/business";
import { pageMetadata } from "@/lib/seo";
import { verifyUnsubscribeToken } from "@/lib/automation/subscriptions";
import { Section } from "@/components/ui/Section";
import { InvalidLinkMessage, UnsubscribeForm } from "./UnsubscribeForm";

export const metadata = pageMetadata({
  title: "Unsubscribe",
  description: `Turn off ${business.name} inventory alerts and saved-vehicle reminders.`,
  path: "/unsubscribe",
  noindex: true,
});

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

/**
 * Unsubscribe landing page. Loading this page never changes anything (email link scanners
 * prefetch URLs); the visitor must press the confirm button, which posts to a server action.
 */
export default async function UnsubscribePage({ searchParams }: PageProps<"/unsubscribe">) {
  const sp = await searchParams;
  const email = first(sp.email).trim().toLowerCase().slice(0, 254);
  const token = first(sp.token).trim().slice(0, 64);
  // Verifying the HMAC is read-only, so it's safe on GET and lets us show a clear message for broken links.
  const valid = Boolean(email && token) && verifyUnsubscribeToken(email, token);

  return (
    <Section tone="surface">
      <div className="mx-auto max-w-xl">
        <h1 className="text-3xl font-bold sm:text-4xl">Email preferences</h1>
        <div className="mt-6 rounded-[var(--radius-md)] border border-line bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
          {valid ? (
            <UnsubscribeForm email={email} token={token} contactEmail={business.email} contactPhone={business.phone.display} />
          ) : (
            <InvalidLinkMessage contactEmail={business.email} />
          )}
        </div>
      </div>
    </Section>
  );
}
