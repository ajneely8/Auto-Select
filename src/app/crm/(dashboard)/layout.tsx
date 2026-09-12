import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/crm/auth";
import { LogoutButton } from "./LogoutButton";
import { CrmNav } from "./Nav";

// Every page under this route group requires a valid session — this is the one place that decides that.
export const dynamic = "force-dynamic";

export default async function CrmDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/crm/login");

  return (
    <div className="min-h-dvh bg-[#0a0a0a] text-white on-dark">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-[#111111]">
        <div className="container-page flex h-16 items-center gap-4">
          <Link href="/crm" className="flex shrink-0 items-center gap-2.5">
            <Image src="/brand-logo.png" alt="" width={200} height={79} className="h-11 w-auto" />
            <span className="font-display text-sm font-bold uppercase tracking-wide text-white/80 max-sm:hidden">Customer Response Management</span>
            <span className="font-display text-sm font-bold uppercase tracking-wide text-white/80 sm:hidden">CRM</span>
          </Link>
          <div className="ml-auto flex items-center gap-4 text-sm">
            <span className="hidden text-white/60 sm:inline">{session.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <div className="lg:flex">
        <CrmNav />
        <main className="min-w-0 flex-1 py-6 lg:py-8">
          <div className="container-page">{children}</div>
        </main>
      </div>
    </div>
  );
}
