/** Public site settings and navigation. Business facts live in ./business.ts. */

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://autoselectgroups.com").replace(/\/$/, "");

export const mainNav = [
  { href: "/inventory", label: "Inventory" },
  { href: "/financing", label: "Financing" },
  { href: "/trade-in", label: "Trade-In" },
  { href: "/find-a-vehicle", label: "Find a Vehicle" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

/** Secondary sections, reachable from the desktop header's "More" menu (and always listed in the mobile menu). */
export const moreNav = [
  { href: "/delivery", label: "Delivery" },
  { href: "/service-contracts", label: "Service Contracts" },
  { href: "/saved", label: "Saved Vehicles" },
] as const;

export const footerNav = {
  shop: [
    { href: "/inventory", label: "Browse inventory" },
    { href: "/find-a-vehicle", label: "Find a vehicle" },
    { href: "/saved", label: "Saved vehicles" },
    { href: "/compare", label: "Compare vehicles" },
    { href: "/schedule", label: "Book an appointment" },
  ],
  buy: [
    { href: "/financing", label: "Financing" },
    { href: "/trade-in", label: "Value your trade" },
    { href: "/delivery", label: "Home & office delivery" },
    { href: "/service-contracts", label: "Service contracts" },
  ],
  company: [
    { href: "/about", label: "About Auto Select" },
    { href: "/services", label: "Automotive services" },
    { href: "/reviews", label: "Customer reviews" },
    { href: "/blog", label: "Car-buying guides" },
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contact & directions" },
  ],
  legal: [
    { href: "/privacy-policy", label: "Privacy Policy" },
    { href: "/terms-of-use", label: "Terms of Use" },
  ],
};

/** The demonstration 360 sequence is shown only in development unless explicitly enabled. */
export const showDemo360 =
  process.env.NEXT_PUBLIC_SHOW_DEMO_360 === "true" ||
  (process.env.NEXT_PUBLIC_SHOW_DEMO_360 !== "false" && process.env.NODE_ENV !== "production");
