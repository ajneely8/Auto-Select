"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { checkCredentials, createSession, isCrmConfigured } from "@/lib/crm/auth";
import { rateLimit } from "@/lib/leads/spam";

export interface LoginState {
  error?: string;
}

/** Up to 8 attempts per IP per 15 minutes — enough for a real typo, not enough for a guessing script. */
export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "unknown";
  const rl = rateLimit(`crm-login:${ip}`, 8, 15 * 60 * 1000);
  if (!rl.ok) return { error: `Too many attempts. Please try again in ${Math.ceil(rl.retryAfterSec / 60)} minute(s).` };

  if (!isCrmConfigured()) {
    return { error: "The CRM hasn't been set up yet. Run `npm run crm:create-user` and set the environment variables." };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Please enter your email and password." };

  if (!checkCredentials(email, password)) {
    return { error: "Incorrect email or password." };
  }

  await createSession(email);
  redirect("/crm");
}
