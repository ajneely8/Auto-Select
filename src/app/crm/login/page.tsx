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
    <div className="flex min-h-dvh items-center justify-center bg-[#0a0a0a] bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(163,230,53,0.06),transparent)] px-4 py-10 on-dark">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Image src="/brand-logo.png" alt="Auto Select" width={200} height={79} className="mx-auto h-16 w-auto" priority />
          <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-white/50">Customer Response Management</p>
        </div>
        <div className="rounded-[20px] border border-white/10 bg-[#161616] p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_12px_28px_-14px_rgba(0,0,0,0.7)] sm:p-8">
          <LoginForm />
        </div>
        <p className="mt-6 text-center text-xs text-white/40">Authorized staff only. This page is not part of the public website.</p>
      </div>
    </div>
  );
}
