import type { Metadata, Viewport } from "next";
import { Inter, Barlow_Semi_Condensed } from "next/font/google";
import "./globals.css";
import { business } from "@/config/business";
import { siteUrl } from "@/config/site";
import { UtilityBar } from "@/components/layout/UtilityBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileActionBar, BackToTop, AttributionAndClicks } from "@/components/layout/FloatingControls";
import { RevealObserver } from "@/components/ui/Reveal";
import { CompareTray } from "@/components/inventory/CompareTray";
import { InventoryAssistant } from "@/components/assistant/InventoryAssistant";
import { ConsentBanner } from "@/components/layout/ConsentBanner";
import { JsonLd } from "@/components/seo/JsonLd";
import { dealerJsonLd } from "@/lib/seo";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const barlow = Barlow_Semi_Condensed({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-barlow", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `Used Cars in Live Oak, TX | ${business.name}`,
    template: `%s | ${business.name}`,
  },
  description:
    "Auto Select is a family-owned online dealership in Live Oak, Texas. Shop used vehicles, get pre-qualified for financing, value your trade, and request delivery or help finding the right car near San Antonio.",
  applicationName: business.name,
  formatDetection: { telephone: false },
  openGraph: { siteName: business.name, locale: "en_US", type: "website" },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  themeColor: "#0a1b33",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${barlow.variable}`}>
      <body className="min-h-dvh flex flex-col antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-[var(--radius-sm)] focus:bg-navy-900 focus:px-4 focus:py-3 focus:font-semibold focus:text-white"
        >
          Skip to main content
        </a>
        <UtilityBar />
        <Header />
        <main id="main" tabIndex={-1} className="flex-1 outline-none">
          {children}
        </main>
        <Footer />
        <MobileActionBar />
        <CompareTray />
        <BackToTop />
        <InventoryAssistant />
        <ConsentBanner />
        <RevealObserver />
        <AttributionAndClicks />
        <JsonLd data={dealerJsonLd()} />
      </body>
    </html>
  );
}
