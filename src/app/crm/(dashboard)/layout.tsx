import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/crm/auth";
import { LogoutButton } from "./LogoutButton";

// Every page under this route group requires a valid session — this is the one place that decides that.
export const dynamic = "force-dynamic";

export default async function CrmDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/crm/login");

  return (
    <div className="min-h-dvh bg-surface">
      <header className="border-b border-line bg-navy-900 text-white on-dark">
        <div className="container-page flex h-16 items-center gap-4">
          <Link href="/crm" className="flex shrink-0 items-center gap-2.5">
            <Image src="/brand-logo.png" alt="" width={200} height={79} className="h-8 w-auto" />
            <span className="font-display text-sm font-bold uppercase tracking-wide text-white/80">CRM</span>
          </Link>
          <div className="ml-auto flex items-center gap-4 text-sm">
            <span className="hidden text-white/70 sm:inline">{session.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="container-page py-8">{children}</main>
    </div>
  );
}
