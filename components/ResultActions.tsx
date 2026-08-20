"use client";

import { useEffect, useRef, useState } from "react";
import { copyText, downloadText, printPage } from "@/lib/share";

// The three things a visitor does with a result once they have it: send it to
// someone, open it in a spreadsheet, or put it on paper. One component, used
// by both calculators, so the row cannot drift apart between them.
//
// Design guide §4.2 puts these last in the result panel, after the figures and
// the tabs — they are what you reach for when you have finished reading, and
// putting them higher competes with the number the page exists to show.
//
// All three run entirely in the browser. Nothing the visitor typed leaves the
// device, which is what the privacy policy promises and what the "no lender
// money" position is worth nothing without.

// Icons are hand-drawn on a 0 0 24 24 grid with square caps — design guide
// §4.3, and the square cap is the Modernist tell. An icon package was pinned
// in package.json for months and imported nowhere; it was removed August 20.
// Guardrail 7: no new dependency, for any reason, and that includes icons.
const ICON = {
  share: "M4 12v8h16v-8M12 3v13M7 8l5-5 5 5",
  csv: "M12 3v12M7 11l5 5 5-5M4 20h16",
  pdf: "M6 9V3h12v6M6 18v3h12v-3M4 9h16v9H4z",
} as const;

function Icon({ d }: { d: string }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="square"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

export default function ResultActions({
  csvFilename,
  buildCsv,
  note,
  disabled = false,
}: {
  csvFilename: string;
  /** Called on click, not on render — the schedule is only built if asked for. */
  buildCsv: () => string;
  /** One line under the row explaining what the CSV actually contains. */
  note: string;
  disabled?: boolean;
}) {
  const [shareState, setShareState] = useState<"idle" | "copied" | "failed">(
    "idle",
  );
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  async function onShare() {
    // The address bar is already in step with the inputs — each calculator
    // keeps it there — so the current URL is the shareable one.
    const ok = await copyText(window.location.href);
    setShareState(ok ? "copied" : "failed");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setShareState("idle"), 2600);
  }

  const shareLabel =
    shareState === "copied"
      ? "Link copied"
      : shareState === "failed"
        ? "Press Ctrl+C"
        : "Share";

  return (
    <div className="no-print mt-5 border-t-rule border-line-strong pt-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onShare}
          disabled={disabled}
          className="btn btn-secondary"
        >
          <Icon d={ICON.share} />
          {shareLabel}
        </button>

        <button
          type="button"
          onClick={() => downloadText(csvFilename, buildCsv())}
          disabled={disabled}
          className="btn btn-secondary"
        >
          <Icon d={ICON.csv} />
          Download CSV
        </button>

        <button
          type="button"
          onClick={printPage}
          disabled={disabled}
          className="btn btn-secondary"
        >
          <Icon d={ICON.pdf} />
          Download PDF
        </button>
      </div>

      {/* Announced to screen readers when it changes, so the copy confirmation
          is not visual-only. */}
      <p aria-live="polite" className="sr-only">
        {shareState === "copied"
          ? "Link copied to the clipboard"
          : shareState === "failed"
            ? "Could not copy automatically. Copy the address bar instead."
            : ""}
      </p>

      <p className="mt-2.5 text-[0.8rem] leading-relaxed text-muted">
        {note} The link carries your figures, not your identity. Everything
        here is generated on your device and nothing is uploaded.
      </p>
    </div>
  );
}
