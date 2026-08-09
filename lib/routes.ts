// ─────────────────────────────────────────────────────────────────────────────
// Internal routes, in one place.
//
// Project brief §3, defect 2: the payoff calculator's URL is still an open
// decision, and five different answers exist across the documents. Nothing is
// indexed yet, so it is still free to change — but only if changing it is one
// edit rather than a hunt through every page that links to it.
//
// When the decision lands, change PAYOFF_PATH here and record it in the
// decisions ledger. Nothing else needs touching.
// ─────────────────────────────────────────────────────────────────────────────

/** What is actually deployed today. Not yet a settled decision. */
export const PAYOFF_PATH = "/mortgage/payoff-with-extra-payments/";

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
