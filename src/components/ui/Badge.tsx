import type { ReactNode } from "react";

const tones = {
  neutral: "bg-surface text-ink border-line",
  navy: "bg-navy-900 text-white border-navy-900",
  success: "bg-success-soft text-success border-[#bfe0cb]",
  warning: "bg-warning-soft text-warning border-[#f0d9a6]",
  accent: "bg-accent-soft text-accent-text border-accent/30",
  dark: "bg-black/70 text-white border-transparent backdrop-blur-[2px]",
};

export function Badge({ tone = "neutral", children, className = "" }: { tone?: keyof typeof tones; children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-[var(--radius-xs)] border px-2 py-0.5 text-xs font-semibold leading-5 ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}

/** Visible marker for content that still needs dealership confirmation. */
export function TodoFlag({ children }: { children: ReactNode }) {
  return <span className="todo-flag">TODO · {children}</span>;
}
