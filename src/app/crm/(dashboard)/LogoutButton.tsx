"use client";

import { LogOut } from "lucide-react";
import { logout } from "./actions";

export function LogoutButton() {
  return (
    <form action={logout}>
      <button type="submit" className="inline-flex min-h-9 items-center gap-1.5 rounded-[var(--radius-sm)] border border-white/25 px-3 text-sm font-medium text-white hover:border-white/50">
        <LogOut className="size-4" aria-hidden /> Log out
      </button>
    </form>
  );
}
