import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Hides the floating "N" dev-mode indicator during `next dev`. It never renders in production regardless.
  devIndicators: false,
  // ssh2 (used by ssh2-sftp-client for the DealerCenter ADF integration) ships a native-ish crypto
  // module Turbopack can't place in an ESM chunk. Keeping it external makes Next.js `require()` it
  // at runtime like a normal Node dependency instead of bundling it.
  serverExternalPackages: ["ssh2", "ssh2-sftp-client"],
  experimental: {
    // Trade-in forms accept up to 6 photos × 8 MB. The default Server Action limit is 1 MB.
    serverActions: { bodySizeLimit: "50mb" },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [60, 75, 85],
    deviceSizes: [360, 480, 640, 768, 1024, 1280, 1536, 1920],
    // Vehicle and team photos are self-hosted under public/ (migrated off the old WordPress site's
    // wp-content/uploads host when DNS cut over — see data/inventory.json's meta.notes). Add an
    // entry here again if a future inventory feed or CDN serves photos from an external host.
    remotePatterns: [],
    minimumCacheTTL: 60 * 60 * 24 * 7,
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    // Preserve links and search rankings from the previous WordPress URLs.
    return [
      { source: "/locate-your-vehicle", destination: "/find-a-vehicle", permanent: true },
      { source: "/car-buying-service", destination: "/find-a-vehicle", permanent: true },
      { source: "/delivery-request", destination: "/delivery", permanent: true },
      { source: "/service-contract", destination: "/service-contracts", permanent: true },
      { source: "/inventory/page/:n", destination: "/inventory", permanent: true },
    ];
  },
};

export default nextConfig;
