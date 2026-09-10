"use client";

import Link from "next/link";
import { useEffect } from "react";
import { business } from "@/config/business";
import { buttonClasses } from "@/components/ui/Button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-page flex min-h-[50vh] flex-col items-center justify-center py-16 text-center">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">Something went wrong</h1>
      <p className="mt-3 max-w-lg text-slate">
        This page didn&apos;t load correctly. Please try again — or call us at{" "}
        <a href={`tel:${business.phone.e164}`} className="font-semibold text-navy-700 underline underline-offset-2">
          {business.phone.display}
        </a>{" "}
        and we&apos;ll help right away.
      </p>
      <div className="mt-6 flex gap-3">
        <button type="button" onClick={reset} className={buttonClasses("primary", "md")}>
          Try again
        </button>
        <Link href="/inventory" className={buttonClasses("outline", "md")}>
          Browse inventory
        </Link>
      </div>
      {error.digest && <p className="mt-6 text-xs text-muted">Reference: {error.digest}</p>}
    </div>
  );
}
