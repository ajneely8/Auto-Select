import type { Metadata } from "next";
import { Inter, Barlow_Semi_Condensed } from "next/font/google";
import "../(site)/globals.css";

/**
 * The CRM's own root layout — deliberately separate from the customer site's root layout
 * (src/app/(site)/layout.tsx). It shares the same design tokens (same globals.css, same fonts)
 * for a consistent look, but renders none of the public chrome: no header, footer, nav, mobile
 * action bar, or inventory assistant. A logged-out visitor here only ever sees the sign-in form
 * in src/app/crm/login — nothing customer-facing leaks in, and nothing CRM-facing leaks out.
 */
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const barlow = Barlow_Semi_Condensed({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-barlow", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Auto Select CRM", template: "%s | Auto Select CRM" },
  robots: { index: false, follow: false },
};

export default function CrmRootLayout({ children }: LayoutProps<"/crm">) {
  return (
    <html lang="en" className={`${inter.variable} ${barlow.variable}`}>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
