import type { CalculatorKey } from "@/lib/routes";

/**
 * The inline SVG for each calculator's icon, keyed by route.
 *
 * This is the one place a tool's glyph is drawn. The header dropdown, the
 * header's mobile menu and the hub tool grid all read it, so a tool cannot
 * show one icon in the nav and a different one on the homepage. Before this,
 * the header and the hub each drew their own copy — and they had already
 * drifted: the payment glyph carried a redundant `rx="0"` on its rect in the
 * header and not on the hub. That is the silent divergence §0.13 exists to
 * stop, caught here before it became visible.
 *
 * These are fragments, not whole `<svg>` elements, because the two surfaces
 * frame them differently and that framing is theirs to keep: the header's
 * RowIcon draws them at 19px with a teal `currentColor` stroke, the hub's
 * IconTile at 22px in ink inside a bordered square. What was duplicated was
 * the path geometry, and only the geometry lives here. Stroke conventions
 * come from whichever wrapper renders them — design guide §4.6: width 1.8,
 * square caps, miter joins, on a `0 0 24 24` viewBox.
 *
 * Keyed over CalculatorKey, so adding a calculator forces an icon for it at
 * compile time rather than rendering nothing (an absent header icon used to
 * fail silently — `ICON[key]` was simply `undefined`).
 */
export const CALC_ICON: Record<CalculatorKey, React.ReactNode> = {
  payment: (
    <>
      <rect x="3" y="6" width="18" height="12" />
      <circle cx="12" cy="12" r="2.6" />
      <path d="M6.5 12h.01M17.5 12h.01" />
    </>
  ),
  payoff: (
    <>
      <path d="M4 7c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3z" />
      <path d="M4 7v5c0 1.7 3.6 3 8 3s8-1.3 8-3V7" />
      <path d="M4 12v5c0 1.7 3.6 3 8 3s8-1.3 8-3v-5" />
    </>
  ),
  payoffVsInvest: (
    <>
      <path d="M12 4v16" />
      <path d="M4 8h6M14 8h6" />
      <path d="M7 8l-3 5h6zM17 8l-3 5h6z" />
    </>
  ),
};
