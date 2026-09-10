"use client";

import { useState } from "react";
import { Heart, Share2, Check, Link2 } from "lucide-react";
import { useFavorites, useCompare, MAX_COMPARE } from "@/lib/shopping/store";

export function FavoriteButton({ id, label, variant = "overlay" }: { id: string; label: string; variant?: "overlay" | "inline" }) {
  const { has, toggle } = useFavorites();
  const saved = has(id);
  const base =
    variant === "overlay"
      ? "size-11 rounded-full bg-white/95 text-ink shadow-[var(--shadow-card)] hover:bg-white"
      : "h-11 gap-2 rounded-[var(--radius-sm)] border border-line-strong bg-white px-3.5 text-sm font-semibold text-ink hover:border-ink";
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={variant === "overlay" ? `${saved ? "Remove" : "Save"} ${label} ${saved ? "from" : "to"} saved vehicles` : undefined}
      onClick={() => toggle(id)}
      className={`inline-flex items-center justify-center transition-colors ${base}`}
    >
      <Heart className={`size-5 transition-colors ${saved ? "fill-accent-text text-accent-text" : ""}`} aria-hidden />
      {variant === "inline" && <span>{saved ? "Saved" : "Save"}</span>}
    </button>
  );
}

export function CompareToggle({ id, label }: { id: string; label: string }) {
  const { has, toggle, full } = useCompare();
  const [note, setNote] = useState("");
  const checked = has(id);
  const inputId = `cmp-${id}`;
  return (
    <div className="relative">
      <label htmlFor={inputId} className={`inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm font-medium ${!checked && full ? "text-muted" : "text-ink"}`}>
        <input
          id={inputId}
          type="checkbox"
          checked={checked}
          onChange={() => {
            const r = toggle(id);
            setNote(r === "full" ? `You can compare up to ${MAX_COMPARE} vehicles. Remove one first.` : "");
          }}
          aria-describedby={note ? `${inputId}-note` : undefined}
          className="size-[18px] rounded-[3px] accent-navy-900 cursor-pointer"
        />
        Compare
        <span className="sr-only"> {label}</span>
      </label>
      <p id={`${inputId}-note`} role="status" className={note ? "absolute left-0 top-full z-10 mt-1 w-56 rounded-[var(--radius-sm)] bg-ink px-2.5 py-1.5 text-xs text-white shadow-[var(--shadow-raised)]" : "sr-only"}>
        {note}
      </p>
    </div>
  );
}

export function ShareButton({ path, title, variant = "icon" }: { path: string; title: string; variant?: "icon" | "inline" }) {
  const [copied, setCopied] = useState(false);
  async function share() {
    const url = `${location.origin}${path}`;
    try {
      if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* user cancelled */
    }
  }
  const Icon = copied ? Check : variant === "icon" ? Share2 : Link2;
  return (
    <button
      type="button"
      onClick={share}
      aria-label={variant === "icon" ? `Share ${title}` : undefined}
      className={
        variant === "icon"
          ? "inline-flex size-11 items-center justify-center rounded-[var(--radius-sm)] text-slate hover:bg-surface hover:text-ink"
          : "inline-flex h-11 items-center gap-2 rounded-[var(--radius-sm)] border border-line-strong bg-white px-3.5 text-sm font-semibold text-ink hover:border-ink"
      }
    >
      <Icon className={`size-5 ${copied ? "text-success" : ""}`} aria-hidden />
      {variant === "inline" && <span>{copied ? "Link copied" : "Share"}</span>}
      <span role="status" className="sr-only">
        {copied ? "Link copied to clipboard" : ""}
      </span>
    </button>
  );
}
