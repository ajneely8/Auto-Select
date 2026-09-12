"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Menu, X, Phone, CalendarDays, Heart, ChevronRight, ChevronDown } from "lucide-react";
import { mainNav, moreNav } from "@/config/site";
import { business } from "@/config/business";
import { buttonClasses } from "@/components/ui/Button";
import { useFavorites } from "@/lib/shopping/store";

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const moreRef = useRef<HTMLLIElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const moreMenuId = useId();
  const { ids: favorites } = useFavorites();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu and the "More" dropdown on navigation.
  useEffect(() => {
    dialogRef.current?.close();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMoreOpen(false);
  }, [pathname]);

  // Close "More" on outside click or Escape.
  useEffect(() => {
    if (!moreOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!moreRef.current?.contains(e.target as Node)) setMoreOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMoreOpen(false);
        moreButtonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [moreOpen]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const moreActive = moreNav.some((item) => isActive(item.href));

  return (
    <header
      data-scrolled={scrolled || undefined}
      className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90 transition-shadow duration-200 data-[scrolled]:shadow-[0_4px_16px_-8px_rgb(17_20_24/0.18)]"
    >
      <div className={`container-page flex items-center gap-4 transition-[height] duration-200 ${scrolled ? "h-14" : "h-16 lg:h-[72px]"}`}>
        <Link href="/" className="shrink-0" aria-label={`${business.name} — home`}>
          <Image
            src="/brand-logo.png"
            alt={`${business.name} — The New Way to Buy a Car`}
            width={200}
            height={79}
            priority
            className={`w-auto transition-[height] duration-200 ${scrolled ? "h-11" : "h-12 lg:h-14"}`}
          />
        </Link>

        {/* Full text nav (incl. "More") needs real room for 8 items — only at xl+. Between md and xl, the hamburger covers it. */}
        <nav aria-label="Main" className="hidden xl:block ml-4">
          <ul className="flex items-center gap-0.5">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className="relative inline-flex h-10 items-center rounded-[var(--radius-sm)] px-3 text-[0.9375rem] font-medium text-ink/85 hover:text-ink hover:bg-surface aria-[current=page]:text-ink aria-[current=page]:after:absolute aria-[current=page]:after:inset-x-3 aria-[current=page]:after:-bottom-[1px] aria-[current=page]:after:h-0.5 aria-[current=page]:after:bg-accent"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li ref={moreRef} className="relative">
              <button
                ref={moreButtonRef}
                type="button"
                aria-haspopup="menu"
                aria-expanded={moreOpen}
                aria-controls={moreMenuId}
                onClick={() => setMoreOpen((o) => !o)}
                className={`relative inline-flex h-10 items-center gap-1 rounded-[var(--radius-sm)] px-3 text-[0.9375rem] font-medium text-ink/85 hover:text-ink hover:bg-surface ${
                  moreActive ? "text-ink after:absolute after:inset-x-3 after:-bottom-[1px] after:h-0.5 after:bg-accent" : ""
                }`}
              >
                More
                <ChevronDown className={`size-4 transition-transform duration-150 ${moreOpen ? "rotate-180" : ""}`} aria-hidden />
              </button>
              <div
                id={moreMenuId}
                role="menu"
                aria-label="More sections"
                hidden={!moreOpen}
                className="absolute left-0 top-full z-10 mt-1.5 min-w-52 rounded-[var(--radius-sm)] border border-line bg-white py-1.5 shadow-[var(--shadow-raised)] animate-fade-in"
              >
                {moreNav.map((item) => (
                  <Link
                    key={item.href}
                    role="menuitem"
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className="flex min-h-11 items-center px-4 text-[0.9375rem] font-medium text-ink hover:bg-surface aria-[current=page]:bg-surface aria-[current=page]:font-semibold"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </li>
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/saved"
            className="relative hidden sm:inline-flex size-11 items-center justify-center rounded-[var(--radius-sm)] text-ink hover:bg-surface"
            aria-label={`Saved vehicles${favorites.length ? ` (${favorites.length})` : ""}`}
          >
            <Heart className="size-5" aria-hidden />
            {favorites.length > 0 && (
              <span className="absolute right-1.5 top-1.5 min-w-4 rounded-full bg-accent px-1 text-center text-[0.625rem] font-bold leading-4 text-navy-900 tabular">{favorites.length}</span>
            )}
          </Link>
          <a href={`tel:${business.phone.e164}`} className="inline-flex xl:hidden size-11 items-center justify-center rounded-[var(--radius-sm)] text-ink hover:bg-surface" aria-label={`Call ${business.phone.display}`}>
            <Phone className="size-5" aria-hidden />
          </a>
          <Link href="/schedule" className={buttonClasses("primary", scrolled ? "sm" : "md", "hidden md:inline-flex")}>
            <CalendarDays className="size-4" aria-hidden />
            Book an Appointment
          </Link>
          <button
            type="button"
            className="inline-flex xl:hidden size-11 items-center justify-center rounded-[var(--radius-sm)] text-ink hover:bg-surface"
            aria-label="Open menu"
            aria-haspopup="dialog"
            onClick={() => dialogRef.current?.showModal()}
          >
            <Menu className="size-6" aria-hidden />
          </button>
        </div>
      </div>

      {/* Native <dialog>: focus is trapped, Esc closes, and the page behind is inert. */}
      <dialog
        ref={dialogRef}
        aria-label="Menu"
        className="m-0 ml-auto h-dvh max-h-dvh w-[min(22rem,88vw)] max-w-none bg-white p-0 shadow-[var(--shadow-overlay)] backdrop:bg-navy-950/50 open:animate-fade-in"
        onClick={(e) => {
          if (e.target === e.currentTarget) dialogRef.current?.close();
        }}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between border-b border-line px-4">
            <span className="font-display text-lg font-bold">Menu</span>
            <button type="button" onClick={() => dialogRef.current?.close()} className="inline-flex size-11 items-center justify-center rounded-[var(--radius-sm)] hover:bg-surface" aria-label="Close menu">
              <X className="size-6" aria-hidden />
            </button>
          </div>
          <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-2 py-3">
            <ul>
              {[
                { href: "/", label: "Home" },
                ...mainNav,
                ...moreNav.map((item) => (item.href === "/saved" ? { ...item, label: `Saved vehicles${favorites.length ? ` (${favorites.length})` : ""}` } : item)),
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={(item.href === "/" ? pathname === "/" : isActive(item.href)) ? "page" : undefined}
                    className="flex min-h-12 items-center justify-between rounded-[var(--radius-sm)] px-3 text-base font-medium text-ink hover:bg-surface aria-[current=page]:bg-surface aria-[current=page]:font-semibold"
                  >
                    {item.label}
                    <ChevronRight className="size-4 text-muted" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="grid gap-2 border-t border-line p-4">
            <Link href="/schedule" className={buttonClasses("primary", "lg", "w-full")}>
              <CalendarDays className="size-4" aria-hidden /> Book an Appointment
            </Link>
            <a href={`tel:${business.phone.e164}`} className={buttonClasses("outline", "lg", "w-full")}>
              <Phone className="size-4" aria-hidden /> Call {business.phone.display}
            </a>
            <p className="pt-1 text-center text-xs text-muted">Mon–Sat 10 AM–6 PM · Sunday closed</p>
          </div>
        </div>
      </dialog>
    </header>
  );
}
