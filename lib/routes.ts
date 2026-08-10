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
 * Nothing is indexed and there is no sitemap yet, so this is still one line to
 * change. After indexing it is a 301 and a ranking dip.
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
