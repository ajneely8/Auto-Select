"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Inbox, BarChart3, type LucideIcon } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const groups: { label: string | null; items: NavItem[] }[] = [
  { label: null, items: [{ href: "/crm", label: "Overview", icon: LayoutDashboard }, { href: "/crm/leads", label: "Leads", icon: Inbox }] },
  { label: "Vehicle inventory", items: [{ href: "/crm/listings", label: "Listing Performance", icon: BarChart3 }] },
];

function useActive() {
  const pathname = usePathname();
  return (href: string) => (href === "/crm" ? pathname === "/crm" : pathname.startsWith(href));
}

const DESKTOP_LINK =
  "flex min-h-11 items-center gap-2.5 rounded-[var(--radius-md)] px-3 text-sm font-medium text-white/60 transition-shadow duration-200 hover:bg-white/5 hover:text-white aria-[current=page]:bg-lime-400 aria-[current=page]:font-semibold aria-[current=page]:text-black aria-[current=page]:shadow-[0_0_16px_0_rgba(163,230,53,0.35)]";
const MOBILE_LINK =
  "flex min-h-12 items-center gap-2 border-b-2 border-transparent px-3 text-sm font-medium text-white/60 aria-[current=page]:border-lime-400 aria-[current=page]:font-semibold aria-[current=page]:text-white";

/** Desktop: a persistent left sidebar. Mobile: a tab strip under the header. Same links, two layouts. */
export function CrmNav() {
  const isActive = useActive();
  const flat = groups.flatMap((g) => g.items);

  return (
    <>
      <aside className="hidden w-56 shrink-0 border-r border-white/10 bg-[#111111] lg:block">
        <nav aria-label="CRM sections" className="sticky top-16 grid gap-4 py-4">
          {groups.map((group, i) => (
            <div key={group.label ?? i}>
              {group.label && <p className="px-6 pb-1.5 text-[0.6875rem] font-semibold uppercase tracking-wider text-white/35">{group.label}</p>}
              <ul className="grid gap-1 px-3">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} aria-current={isActive(item.href) ? "page" : undefined} className={DESKTOP_LINK}>
                      <item.icon className="size-4 shrink-0" aria-hidden />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      <nav aria-label="CRM sections" className="border-b border-white/10 bg-[#111111] lg:hidden">
        <ul className="container-page flex gap-1 overflow-x-auto">
          {flat.map((item) => (
            <li key={item.href}>
              <Link href={item.href} aria-current={isActive(item.href) ? "page" : undefined} className={`${MOBILE_LINK} whitespace-nowrap`}>
                <item.icon className="size-4 shrink-0" aria-hidden />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
