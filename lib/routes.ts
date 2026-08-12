// ─────────────────────────────────────────────────────────────────────────────
// Internal routes, in one place.
//
// The payoff calculator's URL was settled on August 9, 2026 and is recorded in
// the decisions ledger (project brief §2.3). The four rival paths that used to
// appear across the documents are superseded. This comment previously said the
// decision was still open, which was true when it was written and stale by the
// time anyone read it.
//
// It should not be revisited after indexing. If it ever is, it is one edit
// here rather than a hunt through every page that links to it.
// ─────────────────────────────────────────────────────────────────────────────

/** Settled August 9, 2026 — project brief §2.3. */
export const PAYOFF_PATH = "/mortgage/payoff-with-extra-payments/";

/**
 * The monthly payment calculator, moved off the homepage on August 10, 2026.
 *
 * This reverses the "homepage doubles as the payment calculator" entry in the
 * ledger. The path deliberately mirrors PAYOFF_PATH — `/mortgage/<what it
 * does>/` — so the two read as siblings rather than as one tool that happens
 * to live at the root and another that doesn't.
 *
 * On the name: the head term "mortgage calculator" is Tier 3 and unwinnable
 * for years (project brief §7), so the slug targets the phrase that is
 * actually winnable — a payment calculator that includes taxes and insurance,
 * which is the gap the tool genuinely fills.
 *
 * Changing it is one line here and one line in the sitemap it now feeds.
 * After indexing it is a 301 and a ranking dip.
 */
export const PAYMENT_PATH = "/mortgage/payment-with-taxes-and-insurance/";

export type PayoffParams = {
  loanAmount: number;
  ratePct: number;
  termYears: number;
  extra: number;
};

/**
 * Builds a link that opens the payoff calculator with values prefilled.
 *
 * Technical brief §7 lists "results encoded in the URL so links are
 * shareable" as a convention. This is the first place it is implemented.
 * Values are rounded because a shared link full of floating-point noise looks
 * broken, and the calculator re-derives everything from them anyway.
 */
export function payoffHref(p: PayoffParams): string {
  const q = new URLSearchParams({
    loan: String(Math.round(p.loanAmount)),
    rate: String(Number(p.ratePct.toFixed(3))),
    years: String(Math.round(p.termYears)),
    extra: String(Math.round(p.extra)),
  });
  return `${PAYOFF_PATH}?${q.toString()}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// The route registry.
//
// Every page on the site appears here exactly once. Three things read it:
// the header, the footer, and `app/sitemap.ts`. Adding a page is one entry
// here plus wherever it should be linked from — the sitemap picks it up on
// its own, because it iterates this object rather than keeping its own list.
//
// `app/sitemap.ts` also asserts, at build time, that every `app/**/page.tsx`
// has an entry below. Ship a page and forget this file and the BUILD FAILS
// with the path it wants. A failed build deploys nothing, so the live site is
// unaffected — technical brief §1.
// ─────────────────────────────────────────────────────────────────────────────

export const ROUTES = {
  home: "/",
  payment: PAYMENT_PATH,
  payoff: PAYOFF_PATH,
  methodology: "/methodology/",
  corrections: "/corrections/",
  editorialPolicy: "/editorial-policy/",
  about: "/about/",
  contact: "/contact/",
  disclaimer: "/disclaimer/",
  privacy: "/privacy/",
  terms: "/terms/",
} as const;

export type RouteKey = keyof typeof ROUTES;

/**
 * Pages whose last significant edit differs from the site-wide review date in
 * `lib/constants.ts`. Anything absent uses `LAST_REVIEWED`.
 *
 * This exists because Google only uses <lastmod> when it is "consistently and
 * verifiably accurate" — verified August 11, 2026 against
 * https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
 * A date that moves on every deploy is neither, so the sitemap carries the
 * editorial review date instead of the build date. When one page is rewritten
 * without a full site review, put its date here.
 */
export const ROUTE_REVIEWED: Partial<Record<RouteKey, string>> = {
  // Rebuilt August 12, 2026: the plan engine (lump sums, yearly extras,
  // biweekly, delayed starts), the loan-life strip, the tipping point, and
  // roughly 1,600 words of editorial with CFPB and Regulation Z citations.
  // The rest of the site was not reviewed that day, which is exactly the case
  // this map exists for — LAST_REVIEWED still says August 8 and still speaks
  // for every other page.
  payoff: "2026-08-12",
};

/**
 * Routes deliberately kept out of the sitemap. Empty today, and it should
 * stay that way — a page worth building is a page worth listing. It exists so
 * that excluding one is a recorded decision rather than a quiet omission.
 */
export const SITEMAP_EXCLUDE: readonly RouteKey[] = [];
