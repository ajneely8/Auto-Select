import { CarFront, BadgeDollarSign, Repeat, SearchCheck, Truck, Wrench, ShieldCheck, MessageSquare, CalendarClock, BellRing, CalendarCheck2, type LucideIcon } from "lucide-react";
import type { LeadType } from "@/lib/types";

/** One icon per form type, reused across the overview breakdown and the leads list. */
export const TYPE_ICONS: Record<LeadType, LucideIcon> = {
  contact: MessageSquare,
  availability: CarFront,
  "test-drive": CalendarClock,
  appointment: CalendarCheck2,
  financing: BadgeDollarSign,
  "trade-in": Repeat,
  "vehicle-locator": SearchCheck,
  delivery: Truck,
  service: Wrench,
  "service-contract": ShieldCheck,
  "inventory-alert": BellRing,
};
