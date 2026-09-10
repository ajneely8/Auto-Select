import Link from "next/link";
import { business, fullAddress } from "@/config/business";
import { siteUrl } from "@/config/site";
import { pageMetadata } from "@/lib/seo";
import { telHref } from "@/lib/format";
import { TodoFlag } from "@/components/ui/Badge";
import { LegalDocument, type LegalSection } from "@/app/_legal/LegalDocument";

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description: `How ${business.name} collects, uses, and protects information when you use our website, submit a form, or contact us.`,
  path: "/privacy-policy",
});

const site = new URL(siteUrl).host;
const provider = business.financing.providerName;

function NewTab() {
  return <span className="sr-only"> (opens in new tab)</span>;
}

const sections: LegalSection[] = [
  {
    id: "overview",
    title: "Overview",
    content: (
      <>
        <p>
          This Privacy Policy explains how {business.legalName} (&ldquo;{business.name},&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) collects,
          uses, shares, and protects information when you visit {site} (the &ldquo;website&rdquo;), submit a form, use our inventory questions assistant, or
          otherwise contact us.
        </p>
        <p>
          The short version: we collect the information you choose to give us so we can respond to you, we share it only with the service providers who help us do
          that (and with the financing application provider when you choose to apply), and <strong>we do not sell your personal information</strong>.
        </p>
        <p>
          This policy covers our website. Information you provide in person or in purchase, financing, or service documents may also be governed by those
          documents and by applicable law.
        </p>
      </>
    ),
  },
  {
    id: "information-we-collect",
    title: "Information we collect",
    content: (
      <>
        <h3>Information you give us</h3>
        <p>When you fill out a form on our website, we collect the information you enter. Depending on the form, this may include:</p>
        <ul>
          <li>
            <strong>Contact details:</strong> your name, email address, phone number, preferred contact method, and any message you write.
          </li>
          <li>
            <strong>Vehicle interest:</strong> the vehicle you&apos;re asking about, and requested dates and times for test drives or appointments.
          </li>
          <li>
            <strong>Trade-in details:</strong> your vehicle&apos;s VIN or license plate, year, make, model, trim, mileage, condition, loan payoff amount, and any
            photos you upload.
          </li>
          <li>
            <strong>Vehicle search preferences:</strong> the vehicle features, budget, payment range, timeline, and trade-in plans you share in a Find a Vehicle
            request.
          </li>
          <li>
            <strong>Delivery and service details:</strong> a delivery address and notes, or a service location and description of your vehicle.
          </li>
          <li>
            <strong>Service contract requests:</strong> your vehicle&apos;s VIN and mileage.
          </li>
          <li>
            <strong>Inventory alerts:</strong> your email address and the search or vehicle you want updates about.
          </li>
          <li>
            <strong>Your choices:</strong> whether you agreed to receive text messages or marketing emails.
          </li>
        </ul>
        <p>
          Our website forms do not ask for your Social Security number, date of birth, or bank account information. Financing applications are completed through a
          separate secure provider, described in <a href="#how-we-share">How we share information</a>.
        </p>

        <h3>Information collected automatically</h3>
        <p>When you submit a form, we also record limited technical information to route and protect your request:</p>
        <ul>
          <li>The page you submitted the form from and the page that referred you to our website (without query strings).</li>
          <li>Campaign information from the link you used to reach us, such as a UTM source or campaign name.</li>
          <li>
            Your IP address and browser type, which we use for spam prevention and rate limiting. We may use a third-party bot-protection service that processes
            technical information about your browser for the same purpose.
          </li>
        </ul>
        <p>
          Like most websites, our hosting provider may also keep standard server logs, such as IP addresses, pages requested, and error information, for security
          and troubleshooting.
        </p>

        <h3>Information stored only on your device</h3>
        <p>
          Some features save information in your browser&apos;s local storage, not on our servers. See <a href="#device-storage">Cookies and browser storage</a>{" "}
          for details.
        </p>
      </>
    ),
  },
  {
    id: "how-we-use",
    title: "How we use information",
    content: (
      <>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Respond to your questions and requests, including availability checks, test drives, appointments, and delivery requests.</li>
          <li>Prepare preliminary trade-in estimates and search for vehicles that match your request.</li>
          <li>Help you complete a purchase, including paperwork, title, and registration.</li>
          <li>Send confirmation emails about requests you submit and, if you agreed, text messages.</li>
          <li>Send inventory alerts and reminders you signed up for, and marketing emails only if you opted in.</li>
          <li>Protect our website and customers against spam, fraud, and abuse.</li>
          <li>Understand, in aggregate, which pages and features are useful so we can improve the website.</li>
          <li>Comply with legal, tax, and record-keeping obligations.</li>
        </ul>
      </>
    ),
  },
  {
    id: "how-we-share",
    title: "How we share information",
    content: (
      <>
        <p>We share personal information only as described below.</p>
        <h3>Service providers</h3>
        <p>
          We use service providers to operate our business and this website — for example, website hosting, customer relationship management (CRM) software, email
          delivery, text-message delivery, appointment scheduling, and bot protection. These providers receive the information needed to perform their services
          for us.
        </p>
        <h3>Financing application provider</h3>
        <p>
          If you choose to apply for financing, you use a secure online application provided by a third party, {provider}. Information you enter in that
          application — which may include sensitive details such as your Social Security number, income, and employment — is collected by that provider and
          handled under its own privacy policy and terms, along with the disclosures shown in the application. Your application may be shared with lenders so they
          can make a credit decision. Please review the provider&apos;s privacy policy before you apply.
        </p>
        <h3>Inventory questions assistant</h3>
        <p>
          Messages you type into the assistant are sent to a third-party language-model service provider. See{" "}
          <a href="#assistant">Inventory questions assistant</a> below.
        </p>
        <h3>Legal and business reasons</h3>
        <p>
          We may disclose information when we believe it&apos;s required by law, a court order, or a government request; to protect the rights, property, or
          safety of our customers, our business, or others; or as part of a merger, sale, or transfer of our business, subject to this policy.
        </p>
        <h3>What we don&apos;t do</h3>
        <ul>
          <li>We do not sell your personal information.</li>
          <li>We do not share your personal information with third parties for their own marketing.</li>
          <li>This website does not load advertising or social-media tracking pixels.</li>
        </ul>
      </>
    ),
  },
  {
    id: "text-messages",
    title: "Text messages (SMS)",
    content: (
      <>
        <p>
          We send text messages only if you give consent by checking the text-message box on a form. That box is never checked in advance. If you consent, we may
          text you about your request — for example, to confirm we received it or to follow up about an appointment.
        </p>
        <ul>
          <li>
            <strong>Consent is not a condition of purchase.</strong> You can buy a vehicle or use our services without agreeing to receive texts.
          </li>
          <li>Message frequency varies. Message and data rates may apply.</li>
          <li>
            Reply <strong>STOP</strong> to opt out at any time. Reply <strong>HELP</strong> for help, or call us at{" "}
            <a href={telHref(business.phone.e164)}>{business.phone.display}</a>.
          </li>
          <li>We do not sell or share your mobile number or text-message consent with third parties for their marketing.</li>
        </ul>
      </>
    ),
  },
  {
    id: "email",
    title: "Emails and unsubscribing",
    content: (
      <>
        <p>
          When you submit a form, we&apos;ll email you a confirmation and follow up about your request. We send inventory alerts and saved-vehicle reminders only
          if you sign up for them, and marketing emails only if you opt in.
        </p>
        <p>
          Every inventory alert includes an unsubscribe link. You can also ask us to stop marketing emails at any time by contacting us at{" "}
          <a href={`mailto:${business.email}`}>{business.email}</a>. Even after you unsubscribe, we may still send messages about a request or purchase
          you&apos;re actively working on with us.
        </p>
      </>
    ),
  },
  {
    id: "analytics",
    title: "Analytics",
    content: (
      <>
        <p>
          We use privacy-friendly analytics to understand how the website is used — for example, which pages are viewed, which inventory filters are popular, and
          whether a form was submitted successfully. Our analytics are designed to be cookie-free.
        </p>
        <p>
          Our analytics <strong>never receive</strong> your name, phone number, email address, vehicle identification number (VIN), financial details, or the
          text you type into forms. Our website removes this type of information before any analytics event is sent.
        </p>
        <p>
          Where required, we ask for your consent before sending any analytics, and declining is as easy as accepting. The website works the same either way. To
          change your choice, clear this site&apos;s data in your browser settings, and we&apos;ll ask again on your next visit.
        </p>
      </>
    ),
  },
  {
    id: "device-storage",
    title: "Cookies and browser storage",
    content: (
      <>
        <p>This website does not use advertising cookies. It uses your browser&apos;s built-in storage for a few convenience features:</p>
        <ul>
          <li>
            <strong>Saved vehicles, compare list, recently viewed vehicles, and saved searches</strong> are stored in your browser&apos;s local storage. They stay
            on your device and are not sent to us.
          </li>
          <li>
            <strong>Your analytics choice</strong>, where we ask for one, is stored in local storage so we don&apos;t ask again on every visit.
          </li>
          <li>
            <strong>Campaign information</strong> from the link you used to reach us is stored in your browser for the current visit and sent to us only if you
            submit a form.
          </li>
        </ul>
        <p>
          You can clear this information at any time by clearing your browser&apos;s site data. Clearing it removes your saved vehicles and searches from that
          browser.
        </p>
      </>
    ),
  },
  {
    id: "assistant",
    title: "Inventory questions assistant",
    content: (
      <>
        <p>
          Our website may offer an automated assistant that answers questions about our inventory and services. When you use it, the messages you type are sent to
          a third-party language-model service provider, Anthropic, which processes them to generate answers. The assistant&apos;s answers are informational and
          may be incomplete; please confirm important details with our team.
        </p>
        <ul>
          <li>
            <strong>Please don&apos;t enter sensitive information</strong> in the assistant, such as your Social Security number, driver&apos;s license number,
            date of birth, or bank or card numbers.
          </li>
          <li>Conversations may be logged and reviewed to maintain quality, prevent abuse, and keep the service secure.</li>
          <li>The assistant is optional. You can always call, email, or use a form instead.</li>
        </ul>
      </>
    ),
  },
  {
    id: "retention",
    title: "How long we keep information",
    content: (
      <>
        <p>
          We keep personal information only as long as we need it for the purposes described in this policy — for example, to respond to your request, complete a
          transaction, provide service, and meet legal, tax, and record-keeping requirements for vehicle sales. Trade-in photos are kept only as long as needed to
          evaluate your vehicle and document the transaction. Assistant conversation logs are kept for a limited period.
        </p>
        <p>When information is no longer needed, we delete it or de-identify it so it can no longer be linked to you.</p>
        <p>
          <TodoFlag>Confirm specific data-retention periods for leads, trade-in photos, and assistant logs.</TodoFlag>
        </p>
      </>
    ),
  },
  {
    id: "security",
    title: "How we protect information",
    content: (
      <>
        <p>
          We use reasonable administrative, technical, and physical safeguards to protect personal information, including encrypted connections (HTTPS), limited
          access for staff and service providers who need it, and spam and abuse protections on our forms.
        </p>
        <p>
          No website or storage system is completely secure, so we can&apos;t guarantee absolute security. Please don&apos;t send sensitive information such as
          Social Security or bank account numbers through our contact forms, email, or the assistant.
        </p>
      </>
    ),
  },
  {
    id: "children",
    title: "Children's privacy",
    content: (
      <p>
        Our website is intended for adults and is not directed to children under 13. We do not knowingly collect personal information from children under 13. If
        you believe a child has given us personal information, contact us and we will delete it.
      </p>
    ),
  },
  {
    id: "your-choices",
    title: "Your choices and Texas privacy rights",
    content: (
      <>
        <p>You can always:</p>
        <ul>
          <li>Opt out of text messages by replying STOP.</li>
          <li>Unsubscribe from inventory alerts using the link in any alert email.</li>
          <li>Ask us to stop sending marketing emails.</li>
          <li>Decline analytics where we ask for consent, and clear your browser storage at any time.</li>
        </ul>
        <p>
          Depending on where you live and the laws that apply to us — including Texas law — you may have the right to request access to the personal information
          we hold about you, correct inaccurate information, request deletion, obtain a copy of your information, and opt out of the sale of personal information
          or its use for targeted advertising. As noted above, we do not sell personal information or use it for targeted advertising.
        </p>
        <p>
          To make a request, contact us using the information below. We will verify your request before acting on it and respond within the time required by law.
          If we decline your request, we&apos;ll explain why, and you may appeal by replying to our response. We will not discriminate against you for exercising
          your privacy rights.
        </p>
      </>
    ),
  },
  {
    id: "third-party-links",
    title: "Third-party websites",
    content: (
      <p>
        Our website links to third-party sites and services, such as our Facebook and Instagram pages, map and directions services, and the secure financing
        application. Those sites have their own privacy policies, and we are not responsible for their practices. We encourage you to review their policies before
        providing information.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    content: (
      <p>
        We may update this Privacy Policy from time to time. When we do, we&apos;ll change the &ldquo;Last updated&rdquo; date at the top of this page. If we make
        material changes, we&apos;ll take reasonable steps to let you know, such as posting a notice on the website.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact us",
    content: (
      <>
        <p>If you have questions about this policy or want to make a privacy request, contact us:</p>
        <address className="not-italic">
          <strong>{business.legalName}</strong>
          <br />
          {fullAddress}
          <br />
          Phone: <a href={telHref(business.phone.e164)}>{business.phone.display}</a>
          <br />
          Email: <a href={`mailto:${business.email}`}>{business.email}</a>
        </address>
        <p>
          You can also reach us through our <Link href="/contact">contact page</Link>. For questions about how the financing application handles your
          information, refer to the privacy information provided by {provider} in the{" "}
          <a href={business.financing.applicationUrl} target="_blank" rel="noopener noreferrer">
            secure application
            <NewTab />
          </a>
          .
        </p>
      </>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalDocument
      title="Privacy Policy"
      path="/privacy-policy"
      intro="How we collect, use, and protect your information — in plain English."
      lastUpdated="September 10, 2026"
      lastUpdatedIso="2026-09-10"
      sections={sections}
    />
  );
}
