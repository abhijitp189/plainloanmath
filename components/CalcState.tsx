"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { EXAMPLE } from "@/lib/constants";

// The brief asks for a price table "computed from the visitor's own
// rate and down payment." The calculator owns those inputs and the table sits
// several sections further down the page, so the two need one shared value.
//
// This is the smallest thing that works: a snapshot of the three fields the
// table actually reads. It is deliberately NOT the whole calculator state —
// nothing else on the page should be able to reach into the calculator.

export type CalcSnapshot = {
  ratePct: number;
  termYears: number;
  downPct: number;
  /** Home price minus down payment. What the payoff page would start from. */
  loanAmount: number;
};

const FALLBACK: CalcSnapshot = {
  ratePct: EXAMPLE.annualRatePct,
  termYears: EXAMPLE.termYears,
  downPct: EXAMPLE.downPaymentPct,
  loanAmount: EXAMPLE.loanAmount,
};

type Store = {
  snapshot: CalcSnapshot;
  publish: (next: CalcSnapshot) => void;
};

const CalcContext = createContext<Store | null>(null);

export function CalcProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<CalcSnapshot>(FALLBACK);

  // Only write when a value actually moved. Without this the calculator's
  // debounce would still re-render the table on every settle.
  const publish = useCallback((next: CalcSnapshot) => {
    setSnapshot((prev) =>
      prev.ratePct === next.ratePct &&
      prev.termYears === next.termYears &&
      prev.downPct === next.downPct &&
      prev.loanAmount === next.loanAmount
        ? prev
        : next,
    );
  }, []);

  const value = useMemo(() => ({ snapshot, publish }), [snapshot, publish]);

  return <CalcContext.Provider value={value}>{children}</CalcContext.Provider>;
}

/** Read the current inputs. Falls back to the worked example off-provider. */
export function useCalcSnapshot(): CalcSnapshot {
  return useContext(CalcContext)?.snapshot ?? FALLBACK;
}

/**
 * Publish inputs. Returns a no-op when there is no provider, so the calculator
 * stays usable on any page that doesn't have a price table.
 */
export function usePublishCalc(): (next: CalcSnapshot) => void {
  const store = useContext(CalcContext);
  const noop = useCallback(() => {}, []);
  return store?.publish ?? noop;
}
