import { business, fullAddress } from "@/config/business";

/**
 * Towns near Live Oak that get their own "Used cars near <town>" page at /areas-we-serve/<slug>.
 *
 * Google treats near-identical city pages as doorway spam, so every town needs its own intro,
 * its own local section, and at least one question no other town page has. Rules:
 * - Geography comes from each town's Wikipedia article (checked 2026-10-29). Don't add distances,
 *   drive times, or routes unless someone has measured them; the directions link covers that.
 * - Same honesty rules as src/content/faq.ts: no guarantees, rates, discounts, or delivery promises.
 *   Delivery is always a request that the team confirms (availability, timing, any fees).
 * - The best additions are ones only Auto Select can supply: a real review from a buyer in that
 *   town, or a delivery the team has actually made there.
 */
export interface ServiceArea {
  /** URL segment under /areas-we-serve. */
  slug: string;
  name: string;
  /** Meta description, about 160 characters or fewer. */
  description: string;
  /** One line for the hub page and the "other areas" links. */
  summary: string;
  /** Hero intro: where the town sits relative to Live Oak. Verified geography only. */
  intro: string;
  /** A section only this town's page has. */
  local: { title: string; body: string };
  /** Town-specific questions. Plain text, because they're also used in FAQPage structured data. */
  faqs: { q: string; a: string }[];
}

const hoursText = business.hoursSummary
  .map((h) => (h.value.toLowerCase() === "closed" ? `closed ${h.label}` : `${h.label}, ${h.value}`))
  .join("; ");

const deliveryAnswer = (town: string) =>
  `You can request delivery to your home or office in ${town}. Our team confirms availability, timing, and any fees with you before anything is scheduled.`;

const directionsNote = "Use the directions link on this page for the route from your address.";

/** Ordered nearest first: Universal City and Converse share a border with Live Oak. */
export const areas: ServiceArea[] = [
  {
    slug: "universal-city-tx",
    name: "Universal City",
    description:
      "Used cars near Universal City, TX, from Auto Select, a family-owned dealership next door in Live Oak. Shop online, pre-qualify, value your trade, or book a visit.",
    summary: "Right next door, just east of Live Oak and beside JBSA-Randolph.",
    intro:
      "Universal City borders Live Oak, so our office is right next door. Browse our inventory online, then stop by, book a phone consultation, or ask about delivery to your home or office.",
    local: {
      title: "Stationed at JBSA-Randolph?",
      body: "Universal City sits beside JBSA-Randolph. If you're stationed there or work on base, you can do the first steps online: browse vehicles, start the secure financing pre-qualification, and send your trade-in details. Then book a visit or a phone consultation that fits your schedule.",
    },
    faqs: [
      {
        q: "How far is Auto Select from Universal City?",
        a: `Very close. Universal City borders Live Oak, and we're at ${fullAddress}. ${directionsNote}`,
      },
      {
        q: "I'm stationed at JBSA-Randolph. Can I start the process online?",
        a: "Yes. You can browse our inventory, start the secure financing pre-qualification, and send your trade-in details online, then book a visit or a phone consultation that fits your schedule. Financing approval depends on lender requirements.",
      },
      { q: "Can you deliver a vehicle to me in Universal City?", a: deliveryAnswer("Universal City") },
    ],
  },
  {
    slug: "converse-tx",
    name: "Converse",
    description:
      "Used cars near Converse, TX, from Auto Select, a family-owned dealership just north in Live Oak. Browse inventory, pre-qualify, value your trade, or book a visit.",
    summary: "Our neighbor to the south. Live Oak sits on Converse's northern border.",
    intro:
      "Live Oak sits on Converse's northern border, so our office is just up the road. Shop online first, then come see the vehicle, book a phone consultation, or ask about delivery.",
    local: {
      title: "A test drive without a big trip",
      body: "Because Converse and Live Oak are neighbors, a test drive doesn't take much planning. Request a time online or call us, and we'll have the vehicle ready when you arrive. Your request isn't confirmed until a team member contacts you.",
    },
    faqs: [
      {
        q: "How far is Auto Select from Converse?",
        a: `Very close. Live Oak borders Converse to the north, and we're at ${fullAddress}. ${directionsNote}`,
      },
      {
        q: "Should I book before coming over from Converse?",
        a: `We recommend it. Booking a time or calling ahead lets us have the vehicle you want to see ready when you arrive. Our hours are ${hoursText}.`,
      },
      { q: "Can you deliver a vehicle to me in Converse?", a: deliveryAnswer("Converse") },
    ],
  },
  {
    slug: "schertz-tx",
    name: "Schertz",
    description:
      "Used cars near Schertz, TX, from Auto Select, a family-owned dealership in Live Oak on San Antonio's northeast side. Shop online, pre-qualify, or book a visit.",
    summary: "Just past Universal City and Selma, with I-35 running through both Schertz and Live Oak.",
    intro:
      "Schertz sits just east of Universal City and Selma, and I-35 runs through both Schertz and Live Oak. Browse our inventory online, then visit our Live Oak office, book a phone consultation, or ask about delivery.",
    local: {
      title: "Make it one trip",
      body: "Coming from Schertz? Get the slower steps done before you leave home: start the secure financing pre-qualification, send your trade-in details and photos for a preliminary estimate, and book a time so the vehicle is ready when you arrive.",
    },
    faqs: [
      {
        q: "How far is Auto Select from Schertz?",
        a: `We're at ${fullAddress}, on San Antonio's northeast side. Schertz borders Universal City and Selma, and I-35 runs through both Schertz and Live Oak. ${directionsNote}`,
      },
      {
        q: "Can I get a trade-in estimate before I drive over?",
        a: "Yes. Send your vehicle's details and a few photos online, and we'll follow up with a preliminary estimate. The final offer is confirmed after an in-person inspection of the vehicle and its title.",
      },
      { q: "Can you deliver a vehicle to me in Schertz?", a: deliveryAnswer("Schertz") },
    ],
  },
  {
    slug: "kirby-tx",
    name: "Kirby",
    description:
      "Used cars near Kirby, TX, from Auto Select, a family-owned dealership in Live Oak. Start online, book a phone consultation, or ask about home or office delivery.",
    summary: "A short drive south of Live Oak, surrounded by San Antonio.",
    intro:
      "Kirby is surrounded by San Antonio, a short drive south of our office in Live Oak. Start online, then visit, book a phone consultation, or ask about delivery to your home or office.",
    local: {
      title: "Talk it through before you drive over",
      body: "Not ready to make the drive yet? Request a phone consultation for a time that suits you. Once a team member confirms it, we'll call you then to answer your questions. When you're ready, come see the vehicle in Live Oak or ask about delivery.",
    },
    faqs: [
      {
        q: "How far is Auto Select from Kirby?",
        a: `We're at ${fullAddress}, a short drive north of Kirby. ${directionsNote}`,
      },
      {
        q: "Can I talk with someone before I visit?",
        a: `Yes. Request a phone consultation for a time that suits you, and we'll call you once a team member confirms it. You can also call us at ${business.phone.display}. Our hours are ${hoursText}.`,
      },
      { q: "Can you deliver a vehicle to me in Kirby?", a: deliveryAnswer("Kirby") },
    ],
  },
];

export function getArea(slug: string) {
  return areas.find((a) => a.slug === slug) ?? null;
}

/** Google Maps directions from the town to the dealership. */
export function directionsFrom(town: string) {
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(`${town}, TX`)}&destination=${encodeURIComponent(fullAddress)}`;
}
