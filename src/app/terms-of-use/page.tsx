import Link from "next/link";
import { business, fullAddress } from "@/config/business";
import { siteUrl } from "@/config/site";
import { pageMetadata } from "@/lib/seo";
import { telHref } from "@/lib/format";
import { LegalDocument, type LegalSection } from "@/app/_legal/LegalDocument";

export const metadata = pageMetadata({
  title: "Terms of Use",
  description: `The terms that apply when you use the ${business.name} website, including vehicle pricing, financing, estimates, appointments, and the inventory assistant.`,
  path: "/terms-of-use",
});

const site = new URL(siteUrl).host;

const sections: LegalSection[] = [
  {
    id: "agreement",
    title: "About these terms",
    content: (
      <>
        <p>
          These Terms of Use apply to your use of {site} (the &ldquo;website&rdquo;), operated by {business.legalName} (&ldquo;{business.name},&rdquo;
          &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;). By using the website, you agree to these terms. If you don&apos;t agree, please don&apos;t use
          the website.
        </p>
        <p>
          These terms cover the website only. The purchase of a vehicle, a financing agreement, a service contract, or automotive service is governed by the
          separate written documents you sign for that transaction.
        </p>
      </>
    ),
  },
  {
    id: "using-the-website",
    title: "Using the website",
    content: (
      <>
        <p>You may use the website for personal, lawful purposes, such as shopping for a vehicle and contacting us. You agree not to:</p>
        <ul>
          <li>Submit false information or information about another person without their permission.</li>
          <li>Use bots, scrapers, or other automated means to access the website, copy its content, or submit forms.</li>
          <li>Attempt to gain unauthorized access to the website, its systems, or other users&apos; information.</li>
          <li>Interfere with the website&apos;s operation, security, or spam protections.</li>
          <li>Use the website to send spam or unlawful, harmful, or offensive content.</li>
        </ul>
        <p>We may restrict or end access for anyone who violates these terms.</p>
      </>
    ),
  },
  {
    id: "vehicle-information",
    title: "Vehicle information, pricing, and availability",
    content: (
      <>
        <p>
          We work to keep vehicle listings accurate and up to date, but errors can happen. Vehicle information on the website — including price, mileage,
          equipment, features, colors, fuel economy, and history details — may be provided by us, manufacturers, or third-party data sources and may contain
          mistakes or be out of date.
        </p>
        <ul>
          <li>
            <strong>Prices exclude</strong> tax, title, license, and dealer fees, as well as any optional products you choose, unless stated otherwise.
          </li>
          <li>
            <strong>Prices and availability can change</strong> without notice. A vehicle is not reserved or confirmed as available until a member of our team
            confirms it with you.
          </li>
          <li>
            <strong>Photos</strong> may include stock images, and the actual vehicle may differ from its photos in color, equipment, or condition.
          </li>
          <li>
            <strong>Vehicle history reports</strong> are provided by third parties, and we are not responsible for their accuracy or completeness.
          </li>
        </ul>
        <p>
          Please verify any detail that matters to you with our team before you buy. We may correct errors in pricing or vehicle information at any time,
          including after you submit a request. The final price and terms of any purchase are those in your signed purchase documents, and any warranty or
          &ldquo;as is&rdquo; terms are stated in the vehicle&apos;s Buyers Guide and purchase documents.
        </p>
      </>
    ),
  },
  {
    id: "financing",
    title: "Financing",
    content: (
      <>
        <p>
          Nothing on the website is an offer of credit or a commitment to lend. We do not make credit decisions. Financing is subject to lender approval, and
          approval, rates, and terms depend on lender requirements and your qualifications. Pre-qualification is not a guarantee of approval.
        </p>
        <p>
          Our online financing application is provided by a third party, {business.financing.providerName}. Your use of that application is subject to the
          provider&apos;s own terms and privacy policy.
        </p>
      </>
    ),
  },
  {
    id: "estimates",
    title: "Estimates and calculators",
    content: (
      <>
        <ul>
          <li>
            <strong>Trade-in estimates</strong> are preliminary and are not offers to buy your vehicle. The final value depends on an in-person inspection and the
            vehicle&apos;s condition, history, and market conditions.
          </li>
          <li>
            <strong>Payment calculators</strong> use example figures for illustration only. Results are not an offer of credit, a quote, or a promise of any rate,
            term, or payment.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "requests-and-appointments",
    title: "Requests and appointments",
    content: (
      <>
        <p>
          Test-drive, appointment, delivery, and service requests submitted through the website are requests only. They are not confirmed until a member of our
          team confirms them with you. Delivery and certain services depend on availability and may involve fees, which we will confirm with you in advance.
        </p>
        <p>
          A Find a Vehicle request does not guarantee that a particular vehicle will be found or will remain available. Automotive services such as mobile
          mechanic work, tires and wheel balancing, body repair and painting, towing, and jump starts are subject to availability and to the estimate or agreement
          provided for that service.
        </p>
      </>
    ),
  },
  {
    id: "communications",
    title: "Communications",
    content: (
      <p>
        When you submit a form, you agree that we may contact you about your request using the contact information and method you provide. We send text messages
        only with your consent, and consent is not a condition of purchase. You can opt out of texts by replying STOP and unsubscribe from alert emails using the
        link in each email. See our <Link href="/privacy-policy">Privacy Policy</Link> for details.
      </p>
    ),
  },
  {
    id: "assistant",
    title: "Inventory questions assistant",
    content: (
      <>
        <p>
          The website may offer an automated assistant that answers questions about our inventory and services. Its answers are generated automatically using a
          third-party language-model service and are provided for general information only.
        </p>
        <ul>
          <li>Answers may be incomplete, out of date, or inaccurate.</li>
          <li>
            Answers are <strong>not binding offers</strong>, quotes, or commitments about price, availability, financing, trade-in value, or any other term.
          </li>
          <li>Please confirm important details with our team before making a decision.</li>
          <li>Don&apos;t enter sensitive personal or financial information in the assistant.</li>
        </ul>
        <p>We may log conversations for quality and security, and we may limit, change, or discontinue the assistant at any time.</p>
      </>
    ),
  },
  {
    id: "third-party-links",
    title: "Third-party links and services",
    content: (
      <p>
        The website links to third-party websites and services, such as social media pages, map and directions services, and the financing application
        provider. We don&apos;t control those sites and aren&apos;t responsible for their content, policies, or practices. Your use of them is subject to their
        own terms.
      </p>
    ),
  },
  {
    id: "intellectual-property",
    title: "Content and intellectual property",
    content: (
      <>
        <p>
          The website and its content — including text, graphics, logos, and vehicle photos we create — are owned by {business.name} or its licensors and are
          protected by intellectual property laws. You may view and print pages for your personal, non-commercial use. You may not copy, republish, or use the
          content for commercial purposes without our written permission.
        </p>
        <p>
          When you upload photos or other content, such as trade-in photos, you confirm that you have the right to share them, and you allow us to use them to
          evaluate your vehicle and respond to your request.
        </p>
      </>
    ),
  },
  {
    id: "disclaimers",
    title: "Disclaimers",
    content: (
      <>
        <p>
          The website and its content are provided &ldquo;as is&rdquo; and &ldquo;as available.&rdquo; To the fullest extent permitted by law, we disclaim all
          warranties about the website, express or implied, including warranties of accuracy, merchantability, fitness for a particular purpose, and
          non-infringement. We don&apos;t promise that the website will be uninterrupted, error-free, or free of harmful components.
        </p>
        <p>
          Guides and articles on the website are general information, not financial, legal, tax, or mechanical advice. This section does not change any
          warranty or disclosure stated in your vehicle purchase documents, or any rights you have under law that cannot be waived.
        </p>
      </>
    ),
  },
  {
    id: "limitation-of-liability",
    title: "Limitation of liability",
    content: (
      <p>
        To the fullest extent permitted by law, {business.name} and its owners, employees, and service providers will not be liable for any indirect, incidental,
        special, consequential, or punitive damages, or for any loss of data, profits, or goodwill, arising from your use of or inability to use the website or
        its content. Nothing in these terms limits liability that cannot be limited under applicable law.
      </p>
    ),
  },
  {
    id: "governing-law",
    title: "Governing law",
    content: (
      <p>
        These terms are governed by the laws of the State of Texas, without regard to its conflict-of-law rules. Any dispute arising from these terms or your use of
        the website will be brought in the state or federal courts located in Bexar County, Texas, unless applicable law requires otherwise.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to these terms",
    content: (
      <p>
        We may update these terms from time to time. When we do, we&apos;ll change the &ldquo;Last updated&rdquo; date at the top of this page. Your continued use
        of the website after an update means you accept the revised terms.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact us",
    content: (
      <>
        <p>Questions about these terms? Contact us:</p>
        <address className="not-italic">
          <strong>{business.legalName}</strong>
          <br />
          {fullAddress}
          <br />
          Phone: <a href={telHref(business.phone.e164)}>{business.phone.display}</a>
          <br />
          Email: <a href={`mailto:${business.email}`}>{business.email}</a>
        </address>
      </>
    ),
  },
];

export default function TermsOfUsePage() {
  return (
    <LegalDocument
      title="Terms of Use"
      path="/terms-of-use"
      intro="The ground rules for using our website — written to be clear and easy to read."
      lastUpdated="September 10, 2026"
      lastUpdatedIso="2026-09-10"
      sections={sections}
    />
  );
}
