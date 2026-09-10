/**
 * Verified business information — the ONLY place these details should live.
 * Every page, schema block, email template, and the inventory assistant read from here.
 *
 * Source: autoselectgroups.com (reviewed 2026-09-10).
 * Anything marked `TODO(confirm)` must be verified by Auto Select before launch.
 * See docs/CONTENT-CHECKLIST.md.
 */
import type { BusinessInformation } from "@/lib/types";

export const business: BusinessInformation = {
  name: "Auto Select",
  legalName: "Auto Select Groups LLC", // From the current site footer copyright. TODO(confirm) exact registered name.
  tagline: "We Make Car Buying Simple",
  description:
    "Auto Select is an online car dealership in Live Oak, Texas, offering used-vehicle inventory, vehicle-locating assistance, financing applications, trade-in evaluations, delivery, service contracts, and automotive services.",
  address: {
    street: "12702 Toepperwein Rd #230",
    city: "Live Oak",
    region: "TX",
    postalCode: "78233",
    country: "US",
  },
  // Approximate map center for the address above. TODO(confirm) pin placement on the embedded map.
  geo: { lat: 29.5646, lng: -98.3337 },
  phone: { display: "(210) 455-3050", e164: "+12104553050" },
  email: "info@autoselectgroups.com",
  timezone: "America/Chicago",
  // 0 = Sunday … 6 = Saturday. 24-hour "HH:MM" local time.
  hours: [
    { day: 0, open: null, close: null },
    { day: 1, open: "10:00", close: "18:00" },
    { day: 2, open: "10:00", close: "18:00" },
    { day: 3, open: "10:00", close: "18:00" },
    { day: 4, open: "10:00", close: "18:00" },
    { day: 5, open: "10:00", close: "18:00" },
    { day: 6, open: "10:00", close: "18:00" },
  ],
  hoursSummary: [
    { label: "Monday–Saturday", value: "10:00 AM–6:00 PM" },
    { label: "Sunday", value: "Closed" },
  ],
  serviceArea: "Live Oak and the San Antonio area",
  social: {
    facebook: "https://www.facebook.com/AutoSelectgroups",
    instagram: "https://www.instagram.com/autoselect_usa/",
  },
  financing: {
    // Existing secure third-party application (700Credit QuickQualify).
    applicationUrl: "https://www.700dealer.com/QuickQualify/807b82f244f643f3b7a7a6255772a0db-2020624",
    providerName: "700Credit QuickQualify",
    disclosure:
      "Explore competitive financing options. Approval, rates, and terms depend on lender requirements and applicant qualifications. Submitting an inquiry or pre-qualification does not guarantee approval.",
    // Illustration-only rate for the payment calculator. Not an offer of credit.
    // TODO(confirm) the dealership may prefer a different illustrative rate, or none.
    calculatorExampleApr: 8.9,
  },
  languages: ["English", "Spanish"], // Team bios on the current site list fluent Spanish speakers. TODO(confirm) before advertising.
};

export const mapsLinks = {
  directions: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    "12702 Toepperwein Rd #230, Live Oak, TX 78233",
  )}`,
  place: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    "Auto Select, 12702 Toepperwein Rd #230, Live Oak, TX 78233",
  )}`,
  embed: `https://www.google.com/maps?q=${encodeURIComponent(
    "12702 Toepperwein Rd #230, Live Oak, TX 78233",
  )}&output=embed`,
};

export const fullAddress = `${business.address.street}, ${business.address.city}, ${business.address.region} ${business.address.postalCode}`;
