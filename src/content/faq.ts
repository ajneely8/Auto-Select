import { business, fullAddress } from "@/config/business";

/**
 * Frequently asked questions. Answers are plain text (no HTML) because they are also used
 * verbatim in FAQPage structured data — keep the visible page and the schema identical.
 * Never add guarantees, rates, or unverifiable claims here.
 */
export interface FaqItem {
  q: string;
  a: string;
  /** Visible TODO note for the dealership. Not part of the answer or the schema. */
  todo?: string;
}

export interface FaqGroup {
  /** Anchor id for jump links. */
  id: string;
  title: string;
  items: FaqItem[];
}

const hoursText = business.hoursSummary
  .map((h) => (h.value.toLowerCase() === "closed" ? `closed ${h.label}` : `${h.label}, ${h.value}`))
  .join("; ");

export const faqGroups: FaqGroup[] = [
  {
    id: "buying",
    title: "Buying & inventory",
    items: [
      {
        q: "How long does it take to get a car?",
        a: "It depends on the vehicle. A vehicle in our current inventory may be ready fairly quickly once paperwork and payment are arranged, while a vehicle we locate for you elsewhere takes longer. We'll confirm the expected timing for your specific vehicle before you commit.",
      },
      {
        q: "Why use a car-buying service like Auto Select?",
        a: "Our team brings decades of combined dealership experience, and we handle the vehicle, your trade-in, your financing application, and the paperwork together, so you aren't coordinating each piece on your own. We'll explain the numbers and answer your questions at every step.",
      },
      {
        q: "Can you help me find a vehicle that isn't in your inventory?",
        a: "Yes. Send us a Find a Vehicle request with the year range, make, model, features, and budget you have in mind, and we'll search for options and follow up with what we find. Availability varies, so we can't promise a specific vehicle.",
      },
      {
        q: "Do the prices on your website include everything?",
        a: "No. Listed prices do not include tax, title, license, or dealer fees, and prices and availability can change. Contact us to confirm the current price and the total out-the-door cost for a specific vehicle.",
      },
      {
        q: "I'm a first-time buyer. Can you help?",
        a: "Yes. We'll walk you through each step, from setting a budget and choosing a vehicle to the financing application and paperwork. Ask as many questions as you need — we're glad to explain anything that's unfamiliar.",
      },
    ],
  },
  {
    id: "financing",
    title: "Financing",
    items: [
      {
        q: "How do I apply for financing?",
        a: `You can start with our secure online application, provided by ${business.financing.providerName}, or call us at ${business.phone.display} and a team member will explain the process. Submitting an application does not obligate you to buy and does not guarantee approval.`,
      },
      {
        q: "Will applying affect my credit?",
        a: "It depends on the type of inquiry. Pre-qualification tools often use a soft inquiry, while a full loan application typically involves a hard inquiry by the lender. Review the disclosures on the application, or ask us before you apply.",
      },
      {
        q: "What do lenders look at when reviewing an application?",
        a: "Lenders usually consider your credit history, income, existing debts, down payment, the loan term, and the vehicle itself. Approval, rates, and terms are set by the lender based on its requirements and your qualifications.",
      },
      {
        q: "Can I apply if my credit isn't perfect?",
        a: "Yes, you're welcome to apply. Every lender reviews applications individually, so we can't guarantee approval or specific terms, but we'll go over the options that are available to you.",
      },
    ],
  },
  {
    id: "trade-ins",
    title: "Trade-ins",
    items: [
      {
        q: "How is my trade-in value determined?",
        a: "We start with the details and photos you share for a preliminary estimate. The final value depends on an in-person inspection of the vehicle's condition, mileage, equipment, and history, along with current market conditions.",
      },
      {
        q: "Can I trade in a vehicle I still owe money on?",
        a: "In many cases, yes. Bring your lender's name and account information so we can confirm the payoff amount. If you owe more than the vehicle is worth, the difference still has to be addressed, and we'll explain your options before you decide.",
      },
      {
        q: "What should I bring for my trade-in?",
        a: "Bring the title (or your lender's payoff information if there's a loan), your current registration, a valid photo ID, all keys and remotes, and any service records you have.",
      },
    ],
  },
  {
    id: "delivery-test-drives",
    title: "Delivery & test drives",
    items: [
      {
        q: "Can I schedule a test drive?",
        a: "Yes. Test drives can be arranged around your schedule during business hours. Request a time online or call us — your request isn't confirmed until a team member contacts you to confirm it.",
      },
      {
        q: "Can you bring a vehicle to me?",
        a: "In some cases, we may be able to bring a vehicle to you during business hours. Contact us with the vehicle and your location, and we'll confirm whether it's possible and whether any fees apply before scheduling.",
        todo: "Confirm that Auto Select brings vehicles to customers for test drives, and any area limits or fees.",
      },
      {
        q: "How does home or office delivery work?",
        a: "Once your purchase details and paperwork are arranged, we'll schedule a delivery time and place with you. When the vehicle arrives, inspect it and review the documents before you sign. Delivery availability, area, and any fees are confirmed by our team for each purchase.",
      },
    ],
  },
  {
    id: "services",
    title: "Service contracts & services",
    items: [
      {
        q: "Do you offer extended warranties or service contracts?",
        a: "Yes, we offer optional extended service contracts for used vehicles. They're never required to buy a vehicle, and we won't pressure you to add one. Coverage, cost, deductibles, and cancellation terms vary by contract, so review the contract before you decide.",
      },
      {
        q: "What automotive services do you offer?",
        a: "In addition to vehicle sales, we offer a certified mobile mechanic, tires and wheel balancing, body repair and painting, towing, and jump starts. Contact us to check availability and pricing for your situation.",
      },
    ],
  },
  {
    id: "visiting",
    title: "Visiting us",
    items: [
      {
        q: "Where are you located, and what are your hours?",
        a: `We're at ${fullAddress}. Our hours are ${hoursText}. We serve ${business.serviceArea}.`,
      },
      {
        q: "Should I make an appointment before visiting?",
        a: "We recommend it. Calling ahead or booking an appointment lets us have the vehicle you want to see ready when you arrive.",
      },
      {
        q: "What should I bring when I'm ready to buy?",
        a: "Bring a valid driver's license, proof of auto insurance, and your down payment method. If you're financing, bring proof of income and residence if the lender asks for them, and if you're trading in, bring the vehicle's title or payoff information and all keys.",
      },
      {
        q: "Do you handle title and registration?",
        a: "Our team will walk you through the title and registration paperwork for your purchase. Texas motor vehicle sales tax and title and registration fees apply, and we'll go over those costs with you before you sign.",
      },
    ],
  },
];

/** Every FAQ item in display order — use for FAQPage schema or to feature questions elsewhere. */
export const faqAll: FaqItem[] = faqGroups.flatMap((g) => g.items);
