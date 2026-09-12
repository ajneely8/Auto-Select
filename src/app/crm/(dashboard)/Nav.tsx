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
      <aside className="hidden w-56 shrink-0 border-r border-white/10 bg-[#111111] lg:block">
        <nav aria-label="CRM sections" className="sticky top-16 py-4">
          <ul className="grid gap-1 px-3">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className="flex min-h-11 items-center gap-2.5 rounded-[var(--radius-md)] px-3 text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white aria-[current=page]:bg-lime-400 aria-[current=page]:font-semibold aria-[current=page]:text-black"
                >
                  <item.icon className="size-4 shrink-0" aria-hidden />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <nav aria-label="CRM sections" className="border-b border-white/10 bg-[#111111] lg:hidden">
        <ul className="container-page flex gap-1">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className="flex min-h-12 items-center gap-2 border-b-2 border-transparent px-3 text-sm font-medium text-white/60 aria-[current=page]:border-lime-400 aria-[current=page]:font-semibold aria-[current=page]:text-white"
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
