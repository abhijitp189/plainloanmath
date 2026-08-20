import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: the build produces plain HTML files, which Cloudflare
  // Workers serves as static assets from ./out per wrangler.jsonc. Not Pages —
  // Cloudflare put Pages into maintenance and recommends Workers for new
  // projects. Nothing runs on a server. This is what keeps hosting free.
  output: "export",

  // Every page becomes /folder/index.html, so URLs end in a slash:
  // plainloanmath.com/mortgage/payoff-with-extra-payments/
  // Keep this ON. It must stay matched to html_handling:
  // "auto-trailing-slash" in wrangler.jsonc, and changing it changes every
  // URL on the site.
  trailingSlash: true,

  // No image optimization server exists on a static export.
  images: { unoptimized: true },
};

export default nextConfig;
