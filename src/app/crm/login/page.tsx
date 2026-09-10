import Image from "next/image";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/crm/auth";
import { LoginForm } from "./LoginForm";

// Never indexed, never linked from the public site — reached only by whoever already knows the URL.
export const metadata = { title: "CRM Sign In", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function CrmLoginPage() {
  const session = await getSession();
  if (session) redirect("/crm");

  return (
    <div className="flex min-h-dvh items-center justify-center bg-surface px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Image src="/brand-logo.png" alt="Auto Select" width={200} height={79} className="mx-auto h-12 w-auto" priority />
          <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-muted">Internal CRM</p>
        </div>
        <div className="rounded-[var(--radius-md)] border border-line bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
          <LoginForm />
        </div>
        <p className="mt-6 text-center text-xs text-muted">Authorized staff only. This page is not part of the public website.</p>
      </div>
    </div>
  );
}
