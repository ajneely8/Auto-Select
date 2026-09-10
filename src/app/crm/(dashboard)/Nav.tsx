"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Inbox } from "lucide-react";

const items = [
  { href: "/crm", label: "Overview", icon: LayoutDashboard },
  { href: "/crm/leads", label: "Leads", icon: Inbox },
] as const;

function useActive() {
  const pathname = usePathname();
  return (href: string) => (href === "/crm" ? pathname === "/crm" : pathname.startsWith(href));
}

/** Desktop: a persistent left sidebar. Mobile: a tab strip under the header. Same links, two layouts. */
export function CrmNav() {
  const isActive = useActive();

  return (
    <>
      <aside className="hidden w-56 shrink-0 border-r border-line bg-white lg:block">
        <nav aria-label="CRM sections" className="sticky top-16 py-4">
          <ul className="grid gap-1 px-3">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className="flex min-h-11 items-center gap-2.5 rounded-[var(--radius-sm)] border-l-2 border-transparent px-3 text-sm font-medium text-slate hover:bg-surface hover:text-ink aria-[current=page]:border-accent aria-[current=page]:bg-navy-100 aria-[current=page]:font-semibold aria-[current=page]:text-navy-900"
                >
                  <item.icon className="size-4 shrink-0" aria-hidden />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <nav aria-label="CRM sections" className="border-b border-line bg-white lg:hidden">
        <ul className="container-page flex gap-1">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className="flex min-h-12 items-center gap-2 border-b-2 border-transparent px-3 text-sm font-medium text-slate aria-[current=page]:border-accent aria-[current=page]:font-semibold aria-[current=page]:text-ink"
              >
                <item.icon className="size-4" aria-hidden />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
