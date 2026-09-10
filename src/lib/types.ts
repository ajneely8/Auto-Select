/* Core typed models. Keep these provider-neutral so an inventory API, CRM, or DB can map onto them. */

export type VehicleStatus = "available" | "pending" | "sold" | "in-transit";
export type VehicleCondition = "new" | "used" | "certified";

export interface VehiclePhoto {
  url: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface Vehicle {
  id: string;
  slug: string;
  status: VehicleStatus;
  condition: VehicleCondition;
  year: number;
  make: string;
  model: string;
  trim: string | null;
  bodyStyle: string | null;
  /** Advertised price in whole USD. null = "Call for Price". */
  price: number | null;
  salePrice: number | null;
  mileage: number;
  vin: string;
  stockNumber: string;
  exteriorColor: string | null;
  interiorColor: string | null;
  transmission: string | null;
  drivetrain: string | null;
  fuelType: string | null;
  engine: string | null;
  mpgCity: number | null;
  mpgHighway: number | null;
  doors: number | null;
  seats: number | null;
  description: string | null;
  features: string[];
  photos: VehiclePhoto[];
  /**
   * Ordered frame sequence captured around the vehicle (36, 48, or 72 frames).
   * Frame 0 should face the front-left 3/4 angle. See docs/360-MEDIA.md.
   */
  exterior360Frames: string[] | null;
  /** Marks a demonstration frame sequence that is NOT a capture of this vehicle. */
  exterior360IsDemo?: boolean;
  /** Hosted third-party exterior spin (iframe) — used when frames are not self-hosted. */
  exterior360EmbedUrl?: string | null;
  interior360Url: string | null;
  historyReportUrl: string | null;
  featured: boolean;
  /** ISO date. */
  dateAdded: string;
  /** Staff-only notes. Never rendered publicly. */
  internalNotes?: string[];
}

export interface InventoryFile {
  meta: {
    source: string;
    capturedAt: string;
    verified: boolean;
    notes: string[];
  };
  vehicles: Vehicle[];
}

/* ─────────────────────────── Leads ─────────────────────────── */

export type LeadType =
  | "availability"
  | "test-drive"
  | "financing"
  | "trade-in"
  | "vehicle-locator"
  | "delivery"
  | "service"
  | "service-contract"
  | "contact"
  | "appointment"
  | "inventory-alert";

export type ContactMethod = "phone" | "text" | "email";
export type LeadStatus = "new" | "contacted" | "qualified" | "closed" | "spam";

export interface UtmData {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
}

export interface Lead {
  id: string;
  type: LeadType;
  vehicleId: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  preferredContactMethod: ContactMethod;
  message: string;
  marketingConsent: boolean;
  smsConsent: boolean;
  sourcePage: string;
  referrer: string;
  utmData: UtmData;
  createdAt: string;
  status: LeadStatus;
  /** Type-specific payload (TradeIn, VehicleRequest, Appointment, …). */
  details?: TradeIn | VehicleRequest | Appointment | ServiceRequest | DeliveryRequest | Record<string, unknown>;
  /** Internal staff notes, added from the CRM. Never shown to customers. */
  notes?: LeadNote[];
}

export interface LeadNote {
  text: string;
  at: string;
}

export type VehicleConditionRating = "excellent" | "good" | "fair" | "rough";

export interface TradeIn {
  vinOrPlate: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  mileage: number;
  condition: VehicleConditionRating;
  payoffAmount: number | null;
  photoFiles: string[];
}

export interface VehicleRequest {
  condition: "new" | "used" | "either";
  yearMin: number | null;
  yearMax: number | null;
  make: string;
  model: string;
  trim: string;
  bodyStyle: string;
  exteriorColors: string;
  interiorColors: string;
  maxMileage: number | null;
  budget: number | null;
  monthlyPaymentMin: number | null;
  monthlyPaymentMax: number | null;
  requiredFeatures: string;
  timeline: "asap" | "30-days" | "60-days" | "90-days-plus" | "researching";
  hasTradeIn: "yes" | "no" | "unsure";
  notes: string;
}

export type AppointmentKind = "test-drive" | "dealership-visit" | "phone-consultation" | "service";

export interface Appointment {
  kind: AppointmentKind;
  /** Local date "YYYY-MM-DD" in the dealership timezone. */
  date: string;
  /** Local time "HH:MM". */
  time: string;
  vehicleId: string | null;
  /** "requested" until the scheduling provider returns a confirmation. */
  status: "requested" | "confirmed" | "cancelled";
  providerReference: string | null;
}

export interface ServiceRequest {
  service: "mobile-mechanic" | "tires-balancing" | "body-paint" | "towing" | "jump-start" | "other";
  vehicleDescription: string;
  location: string;
  urgency: "today" | "this-week" | "flexible";
  details: string;
}

export interface DeliveryRequest {
  vehicleId: string | null;
  street: string;
  unit: string;
  city: string;
  state: string;
  zip: string;
  deliveryNotes: string;
  preferredWindow: string;
}

export interface Review {
  id: string;
  author: string;
  body: string;
  /** Only set when sourced from a verifiable platform. */
  rating: number | null;
  source: string;
  sourceUrl: string | null;
}

/* ─────────────────────── Business info ─────────────────────── */

export interface BusinessHours {
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  open: string | null;
  close: string | null;
}

export interface BusinessInformation {
  name: string;
  legalName: string;
  tagline: string;
  description: string;
  address: { street: string; city: string; region: string; postalCode: string; country: string };
  geo: { lat: number; lng: number };
  phone: { display: string; e164: string };
  email: string;
  timezone: string;
  hours: BusinessHours[];
  hoursSummary: { label: string; value: string }[];
  serviceArea: string;
  social: { facebook: string; instagram: string };
  financing: {
    applicationUrl: string;
    providerName: string;
    disclosure: string;
    calculatorExampleApr: number;
  };
  languages: string[];
}
