import fs from "node:fs";
import path from "node:path";
import type { MetadataRoute } from "next";
import { SITE, LAST_REVIEWED } from "@/lib/constants";
import { ROUTES, ROUTE_REVIEWED, SITEMAP_EXCLUDE, type RouteKey } from "@/lib/routes";

// ─────────────────────────────────────────────────────────────────────────────
// The sitemap.
//
// This file runs once, at build time, and Next writes the result to
// out/sitemap.xml. Nothing runs on a server — technical brief §4.
//
// TWO FIELDS ONLY: <loc> and <lastmod>. Google's own documentation says it
// ignores <priority> and <changefreq> outright, and uses <lastmod> only when
// it is consistently and verifiably accurate. Verified August 11, 2026:
//   https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
// A field nobody reads is a field that drifts, so they are not emitted.
//
// WHY lastmod IS THE REVIEW DATE, NOT THE BUILD DATE. `new Date()` here would
// stamp every page as freshly modified on every deploy, including deploys
// that changed one line of CSS. That is the pattern that makes lastmod
// untrustworthy, and it is the same bug the footer copyright year has: a date
// frozen at build time pretending to be current. LAST_REVIEWED in
// lib/constants.ts is a real editorial date and matches what the page shows
// the reader.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Required. With `output: "export"`, Next treats `sitemap.xml` as a route
 * handler and refuses to build without this line — the build fails with
 * "export const dynamic = force-static not configured on route /sitemap.xml".
 * Do not remove it.
 */
export const dynamic = "force-static";

const APP_DIR = path.join(process.cwd(), "app");

/**
 * Every route the App Router will actually generate, read off disk.
 *
 * A directory counts as a route if it holds a `page.tsx`. Route groups
 * `(name)`, private folders `_name`, and dynamic segments `[slug]` are skipped
 * — none exist today, and a static export has nothing to enumerate for the
 * last of those anyway.
 */
function routesOnDisk(dir: string = APP_DIR, prefix = ""): string[] {
  const found: string[] = [];

  if (fs.existsSync(path.join(dir, "page.tsx"))) {
    found.push(prefix === "" ? "/" : `${prefix}/`);
  }

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const name = entry.name;
    if (name.startsWith("_") || name.startsWith("(") || name.startsWith("[")) continue;
    found.push(...routesOnDisk(path.join(dir, name), `${prefix}/${name}`));
  }

  return found;
}

/**
 * Fails the build if a page exists that no one listed in `lib/routes.ts`.
 *
 * This is the whole reason the sitemap can be trusted. Without it, shipping a
 * calculator and forgetting one line leaves the page out of the sitemap
 * silently, and nothing surfaces the omission for months. A failed build
 * deploys nothing and leaves the live site untouched — technical brief §1 —
 * so the cost of being wrong here is a build log, not an outage.
 */
function assertRegistryIsComplete(): void {
  let onDisk: string[];
  try {
    onDisk = routesOnDisk();
  } catch {
    // Cannot read the app directory. Do not take the build down over a check.
    return;
  }

  const registered = new Set<string>(Object.values(ROUTES));
  const missing = onDisk.filter((route) => !registered.has(route)).sort();

  if (missing.length > 0) {
    throw new Error(
      `sitemap: ${missing.length} page(s) exist but are not in ROUTES in lib/routes.ts:\n` +
        missing.map((route) => `  ${route}`).join("\n") +
        `\n\nAdd one entry to ROUTES for each, then rebuild. If a page must stay ` +
        `out of the sitemap, add it to ROUTES and list its key in SITEMAP_EXCLUDE.`,
    );
  }

  // The mirror of the check above, added August 19, 2026 after it was needed.
  //
  // The original assertion only ran one way: every page on disk must have a
  // route. A route with no page passed silently, and on August 19 that shipped
  // a live 404. A delivery meant to add /learn/when-does-pmi-drop-off/ landed
  // its page.tsx in the neighbouring article's folder instead. Both files are
  // called page.tsx, so nothing looked wrong. The result: routes.ts declared
  // the article, the header and /learn/ and the payment calculator all linked
  // to it, the sitemap listed it, the build succeeded, and the URL 404ed. The
  // other article was silently replaced at the same time.
  //
  // A route entry is a promise that a page exists. This makes the build keep it.
  const onDiskSet = new Set(onDisk);
  const orphaned = Object.entries(ROUTES)
    .filter(([, route]) => !onDiskSet.has(route))
    .map(([key, route]) => `  ${key}: ${route}`)
    .sort();

  if (orphaned.length > 0) {
    throw new Error(
      `sitemap: ${orphaned.length} route(s) are declared in ROUTES in ` +
        `lib/routes.ts but have no page.tsx on disk:\n` +
        orphaned.join("\n") +
        `\n\nEach would be linked from the header, the silo index and the ` +
        `sitemap, and would return 404. Add the missing app/<path>/page.tsx, ` +
        `or remove the ROUTES entry.`,
    );
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  assertRegistryIsComplete();

  const excluded = new Set<RouteKey>(SITEMAP_EXCLUDE);
  const base = SITE.url.replace(/\/$/, "");

  return (Object.keys(ROUTES) as RouteKey[])
    .filter((key) => !excluded.has(key))
    .map((key) => ({
      url: `${base}${ROUTES[key]}`,
      lastModified: ROUTE_REVIEWED[key] ?? LAST_REVIEWED,
    }));
}
