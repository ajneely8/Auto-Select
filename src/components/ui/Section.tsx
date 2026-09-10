import type { ReactNode } from "react";

export function Section({
  id,
  tone = "white",
  className = "",
  children,
  labelledBy,
}: {
  id?: string;
  tone?: "white" | "surface" | "navy" | "ink";
  className?: string;
  children: ReactNode;
  labelledBy?: string;
}) {
  const tones = {
    white: "bg-white",
    surface: "bg-surface",
    navy: "bg-navy-900 text-white on-dark",
    ink: "bg-charcoal text-white on-dark",
  };
  return (
    <section id={id} aria-labelledby={labelledBy} className={`${tones[tone]} py-14 sm:py-20 ${className}`}>
      <div className="container-page">{children}</div>
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  intro,
  id,
  align = "left",
  action,
  as: H = "h2",
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  id?: string;
  align?: "left" | "center";
  action?: ReactNode;
  as?: "h1" | "h2";
}) {
  return (
    <div
      data-reveal
      className={`mb-8 sm:mb-10 flex flex-col gap-4 ${align === "center" ? "items-center text-center mx-auto max-w-2xl" : "sm:flex-row sm:items-end sm:justify-between"}`}
    >
      <div className={align === "center" ? "" : "max-w-2xl"}>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <H id={id} className="text-3xl sm:text-[2.5rem] font-bold leading-[1.08]">
          {title}
        </H>
        {intro && <div className="mt-3 text-[1.0625rem] leading-relaxed opacity-85">{intro}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  intro,
  children,
  breadcrumbs,
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
  breadcrumbs?: ReactNode;
}) {
  return (
    <header className="relative bg-navy-900 text-white on-dark overflow-hidden">
      <div aria-hidden className="absolute inset-y-0 right-0 w-1/2 opacity-[0.07] bg-[repeating-linear-gradient(115deg,#fff_0_1px,transparent_1px_22px)]" />
      <div className="container-page relative py-10 sm:py-14">
        {breadcrumbs}
        {eyebrow && <p className="eyebrow !text-accent mb-2">{eyebrow}</p>}
        <h1 className="text-[2.25rem] sm:text-5xl font-bold leading-[1.05] max-w-3xl">{title}</h1>
        {intro && <div className="mt-4 max-w-2xl text-lg text-white/80 leading-relaxed">{intro}</div>}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </header>
  );
}
