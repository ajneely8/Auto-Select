import type { Metadata } from "next";
import { business, fullAddress } from "@/config/business";
import { siteUrl } from "@/config/site";
import type { Vehicle } from "@/lib/types";
import { displayPrice, vehicleFullName } from "@/lib/format";

export function pageMetadata({
  title,
  description,
  path,
  image,
  noindex,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  noindex?: boolean;
  type?: "website" | "article";
}): Metadata {
  const url = `${siteUrl}${path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type,
      url,
      title,
      description,
      siteName: business.name,
      locale: "en_US",
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: { card: "summary_large_image", title, description, ...(image ? { images: [image] } : {}) },
  };
}

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** AutoDealer (a LocalBusiness subtype) using only verified NAP + hours. No ratings, no geo guess. */
export function dealerJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    "@id": `${siteUrl}/#dealer`,
    name: business.name,
    legalName: business.legalName,
    slogan: business.tagline,
    description: business.description,
    url: siteUrl,
    logo: `${siteUrl}/brand-logo.png`,
    image: `${siteUrl}/brand-logo.png`,
    telephone: business.phone.e164,
    email: business.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: business.address.street,
      addressLocality: business.address.city,
      addressRegion: business.address.region,
      postalCode: business.address.postalCode,
      addressCountry: business.address.country,
    },
    areaServed: [
      { "@type": "City", name: "Live Oak" },
      { "@type": "City", name: "San Antonio" },
    ],
    openingHoursSpecification: business.hours
      .filter((h) => h.open && h.close)
      .map((h) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: `https://schema.org/${dayNames[h.day]}`, opens: h.open, closes: h.close })),
    sameAs: [business.social.facebook, business.social.instagram],
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: `${siteUrl}${it.path}` })),
  };
}

export function vehicleJsonLd(v: Vehicle) {
  const price = displayPrice(v);
  const photoUrl = (u: string) => (u.startsWith("http") ? u : `${siteUrl}${u}`);
  return {
    "@context": "https://schema.org",
    "@type": "Car",
    name: vehicleFullName(v),
    url: `${siteUrl}/inventory/${v.slug}`,
    vehicleIdentificationNumber: v.vin,
    sku: v.stockNumber,
    brand: { "@type": "Brand", name: v.make },
    manufacturer: v.make,
    model: v.model,
    vehicleModelDate: String(v.year),
    ...(v.trim ? { vehicleConfiguration: v.trim } : {}),
    ...(v.bodyStyle ? { bodyType: v.bodyStyle } : {}),
    itemCondition: v.condition === "new" ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition",
    mileageFromOdometer: { "@type": "QuantitativeValue", value: v.mileage, unitCode: "SMI" },
    ...(v.exteriorColor ? { color: v.exteriorColor } : {}),
    ...(v.interiorColor ? { vehicleInteriorColor: v.interiorColor } : {}),
    ...(v.transmission ? { vehicleTransmission: v.transmission } : {}),
    ...(v.drivetrain ? { driveWheelConfiguration: v.drivetrain } : {}),
    ...(v.fuelType ? { fuelType: v.fuelType } : {}),
    ...(v.engine ? { vehicleEngine: { "@type": "EngineSpecification", name: v.engine } } : {}),
    ...(v.doors ? { numberOfDoors: v.doors } : {}),
    ...(v.seats ? { seatingCapacity: v.seats } : {}),
    image: v.photos.slice(0, 8).map((p) => photoUrl(p.url)),
    ...(v.description ? { description: v.description } : {}),
    offers:
      price != null
        ? {
            "@type": "Offer",
            price,
            priceCurrency: "USD",
            availability: v.status === "sold" ? "https://schema.org/SoldOut" : v.status === "available" ? "https://schema.org/InStock" : "https://schema.org/LimitedAvailability",
            seller: { "@id": `${siteUrl}/#dealer` },
            url: `${siteUrl}/inventory/${v.slug}`,
          }
        : undefined,
  };
}

export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
  };
}

export function articleJsonLd(a: { title: string; description: string; path: string; datePublished: string; dateModified?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.description,
    url: `${siteUrl}${a.path}`,
    datePublished: a.datePublished,
    dateModified: a.dateModified ?? a.datePublished,
    author: { "@type": "Organization", name: business.name },
    publisher: { "@id": `${siteUrl}/#dealer` },
  };
}

export { fullAddress };
