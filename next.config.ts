import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: Cloudflare Pages builds this into plain HTML files.
  // Nothing runs on a server. This is what keeps hosting free and simple.
  output: "export",

  // Every page becomes /folder/index.html, so URLs end in a slash:
  // plainloanmath.com/mortgage-calculator/payoff-extra-payments/
  // Keep this ON. Changing it later changes every URL on the site.
  trailingSlash: true,

  // No image optimization server exists on a static export.
  images: { unoptimized: true },
};

export default nextConfig;
