import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "light" | "outline-light";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap rounded-[var(--radius-sm)] transition-[background-color,border-color,color,box-shadow] duration-150 disabled:opacity-60 disabled:pointer-events-none select-none";

const variants: Record<Variant, string> = {
  // Dark navy text on the gold fill — white text on gold fails contrast (~2.4:1).
  primary: "bg-accent text-navy-900 hover:bg-accent-hover shadow-[0_1px_0_rgb(0_0_0/0.08)]",
  secondary: "bg-navy-900 text-white hover:bg-navy-800",
  outline: "border border-line-strong bg-white text-ink hover:border-ink",
  ghost: "text-ink hover:bg-surface",
  light: "bg-white text-navy-900 hover:bg-navy-100",
  "outline-light": "border border-white/40 text-white hover:border-white hover:bg-white/5",
};

const sizes: Record<Size, string> = {
  sm: "min-h-9 px-3 text-sm",
  md: "min-h-11 px-5 text-[0.9375rem]",
  lg: "min-h-12 px-6 text-base",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md", extra = "") {
  // Allow responsive visibility like "hidden md:inline-flex": drop the base display so `hidden` isn't overridden.
  const display = /(^|\s)hidden(\s|$)/.test(extra) ? base.replace("inline-flex ", "") : base;
  return `${display} ${variants[variant]} ${sizes[size]} ${extra}`;
}

interface Common {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

export function Button({ variant, size, className = "", ...props }: Common & ComponentProps<"button">) {
  return <button {...props} className={buttonClasses(variant, size, className)} />;
}

export function ButtonLink({
  variant,
  size,
  className = "",
  external,
  ...props
}: Common & ComponentProps<typeof Link> & { external?: boolean }) {
  if (external) {
    const { href, ...rest } = props;
    return (
      <a
        {...(rest as ComponentProps<"a">)}
        href={String(href)}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClasses(variant, size, className)}
      />
    );
  }
  return <Link {...props} className={buttonClasses(variant, size, className)} />;
}
