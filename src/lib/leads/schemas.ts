/**
 * Server-side validation for every form. The browser also validates (HTML constraints + inline messages),
 * but these schemas are the source of truth. Field names here match the `name` attributes in the forms.
 */
import { z } from "zod";
import { normalizePhone } from "./sanitize";
import type { LeadType } from "@/lib/types";

const req = (label: string, max = 120) => z.string().trim().min(1, `Please enter ${label}.`).max(max, `${label} is too long.`);
const opt = (max = 500) => z.string().trim().max(max).optional().default("");
const checkbox = z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean());
const optNum = (max: number) =>
  z.preprocess(
    (v) => (v === "" || v == null ? null : Number(String(v).replace(/[^\d.]/g, ""))),
    z.number().min(0).max(max).nullable(),
  );
const currentYear = new Date().getFullYear();
/** Required integer that tolerates "48,500" or "48500 mi". */
const reqInt = (label: string, max: number) =>
  z.preprocess((v) => (typeof v === "string" ? v.replace(/\D/g, "") : v), z.coerce.number({ message: `Please enter ${label}.` }).int().min(0).max(max, `Please check ${label}.`));

export const contactFields = z
  .object({
    firstName: req("your first name", 60),
    lastName: req("your last name", 60),
    email: z.string().trim().toLowerCase().email("Please enter a valid email address.").max(120),
    phone: z
      .string()
      .trim()
      .transform((v, ctx) => {
        const n = normalizePhone(v);
        if (!n) ctx.addIssue({ code: "custom", message: "Please enter a valid 10-digit U.S. phone number." });
        return n;
      }),
    preferredContactMethod: z.enum(["phone", "text", "email"]).default("phone"),
    message: opt(2000),
    marketingConsent: checkbox.default(false),
    smsConsent: checkbox.default(false),
    vehicleId: opt(40),
  })
  .superRefine((d, ctx) => {
    if (d.preferredContactMethod === "text" && !d.smsConsent)
      ctx.addIssue({ code: "custom", path: ["smsConsent"], message: "To be contacted by text, please check the text-message consent box." });
  });

/** Optional contact variant for forms that only need an email (alerts). */
const emailOnly = z.object({
  email: z.string().trim().toLowerCase().email("Please enter a valid email address.").max(120),
  firstName: opt(60),
});

const appointmentFields = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please choose a date."),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Please choose a time."),
});

export const typeSchemas = {
  contact: z.object({ subject: opt(120) }),
  availability: z.object({ vehicleId: req("a vehicle", 40) }),
  "test-drive": appointmentFields.extend({ vehicleId: req("a vehicle", 40) }),
  appointment: appointmentFields.extend({
    kind: z.enum(["test-drive", "dealership-visit", "phone-consultation", "service"], { message: "Please choose an appointment type." }),
  }),
  financing: z.object({
    financingTopic: z.enum(["pre-qualification", "first-time-buyer", "rebuilding-credit", "general"]).default("general"),
    hasTradeIn: z.enum(["yes", "no", "unsure"]).default("unsure"),
  }),
  "trade-in": z.object({
    vinOrPlate: opt(20),
    tradeYear: z.coerce.number({ message: "Please enter the year." }).int().min(1970, "Please enter a valid year.").max(currentYear + 1, "Please enter a valid year."),
    tradeMake: req("the make", 40),
    tradeModel: req("the model", 60),
    tradeTrim: opt(60),
    tradeMileage: reqInt("the mileage", 999_999),
    tradeCondition: z.enum(["excellent", "good", "fair", "rough"], { message: "Please choose a condition." }),
    payoffAmount: optNum(500_000),
    contactConsent: checkbox.refine((v) => v, "Please confirm we may contact you about this estimate."),
  }),
  "vehicle-locator": z
    .object({
      desiredCondition: z.enum(["new", "used", "either"]).default("either"),
      yearMin: optNum(currentYear + 2),
      yearMax: optNum(currentYear + 2),
      desiredMake: opt(40),
      desiredModel: opt(60),
      desiredTrim: opt(60),
      desiredBody: opt(40),
      exteriorColors: opt(120),
      interiorColors: opt(120),
      maxMileage: optNum(500_000),
      budget: optNum(1_000_000),
      monthlyMin: optNum(20_000),
      monthlyMax: optNum(20_000),
      requiredFeatures: opt(600),
      timeline: z.enum(["asap", "30-days", "60-days", "90-days-plus", "researching"]).default("researching"),
      hasTradeIn: z.enum(["yes", "no", "unsure"]).default("unsure"),
    })
    .superRefine((d, ctx) => {
      if (!d.desiredMake && !d.desiredBody && !d.requiredFeatures)
        ctx.addIssue({ code: "custom", path: ["desiredMake"], message: "Tell us at least a make, a body style, or the features you need." });
      if (d.yearMin && d.yearMax && d.yearMin > d.yearMax) ctx.addIssue({ code: "custom", path: ["yearMax"], message: "The latest year should be after the earliest year." });
      if (d.monthlyMin && d.monthlyMax && d.monthlyMin > d.monthlyMax) ctx.addIssue({ code: "custom", path: ["monthlyMax"], message: "The maximum should be higher than the minimum." });
    }),
  delivery: z.object({
    street: req("a street address", 120),
    unit: opt(40),
    city: req("a city", 60),
    state: z.string().trim().length(2, "Use the 2-letter state code.").toUpperCase().default("TX"),
    zip: z.string().trim().regex(/^\d{5}(-\d{4})?$/, "Please enter a valid ZIP code."),
    deliveryNotes: opt(600),
    preferredWindow: opt(80),
  }),
  service: z.object({
    service: z.enum(["mobile-mechanic", "tires-balancing", "body-paint", "towing", "jump-start", "other"], { message: "Please choose a service." }),
    vehicleDescription: req("your vehicle's year, make, and model", 120),
    location: opt(160),
    urgency: z.enum(["today", "this-week", "flexible"]).default("flexible"),
  }),
  "service-contract": z.object({
    vin: z.string().trim().toUpperCase().regex(/^[A-HJ-NPR-Z0-9]{17}$/, "Please enter the 17-character VIN."),
    contractMileage: reqInt("the mileage", 999_999),
  }),
  "inventory-alert": z.object({
    alertQuery: z.string().max(1000).default(""),
    alertVehicleId: opt(40),
    alertConsent: checkbox.refine((v) => v, "Please confirm you'd like to receive these emails."),
  }),
} satisfies Record<LeadType, z.ZodType>;

export const usesContactFields = (t: LeadType) => t !== "inventory-alert";
export const emailOnlySchema = emailOnly;

export const LEAD_LABELS: Record<LeadType, string> = {
  availability: "Availability check",
  "test-drive": "Test-drive request",
  appointment: "Appointment request",
  financing: "Financing inquiry",
  "trade-in": "Trade-in estimate",
  "vehicle-locator": "Vehicle-locator request",
  delivery: "Delivery request",
  service: "Service request",
  "service-contract": "Service-contract quote",
  contact: "General contact",
  "inventory-alert": "Inventory alert signup",
};

/** Fields that must never appear in email notifications or analytics. */
export const SENSITIVE_FIELDS = new Set(["payoffAmount", "monthlyMin", "monthlyMax", "budget", "vin", "vinOrPlate"]);
