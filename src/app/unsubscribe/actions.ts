"use server";

import { unsubscribeEmail, verifyUnsubscribeToken } from "@/lib/automation/subscriptions";

export type UnsubscribeState = { status: "idle" } | { status: "success" } | { status: "invalid" } | { status: "error" };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOKEN = /^[A-Za-z0-9_-]{16,64}$/;

/**
 * Turns off inventory alerts and saved-vehicle reminders for an email address.
 * Runs only on an explicit POST from the confirm button — never on page load — so link scanners
 * and email prefetchers can't unsubscribe anyone. The signed token is re-verified here.
 */
export async function unsubscribeAction(_prev: UnsubscribeState, formData: FormData): Promise<UnsubscribeState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const token = String(formData.get("token") ?? "").trim();

  if (email.length > 254 || !EMAIL.test(email) || !TOKEN.test(token) || !verifyUnsubscribeToken(email, token)) {
    return { status: "invalid" };
  }

  try {
    // Same response whether or not the address had active subscriptions — don't reveal subscription status.
    await unsubscribeEmail(email);
    return { status: "success" };
  } catch (err) {
    console.error("[unsubscribe] failed:", err);
    return { status: "error" };
  }
}
