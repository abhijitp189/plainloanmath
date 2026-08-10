// ─────────────────────────────────────────────────────────────────────────────
// Shareable results.
//
// Technical brief §7 lists "results encoded in the URL so links are shareable"
// as a convention, and recorded it as half-built: the payoff calculator read
// query parameters, but nothing ever wrote them, so there was no link to
// share. This file is the other half.
//
// Nothing here talks to a server. A share link carries the visitor's figures
// in the address bar of their own browser and goes wherever they paste it —
// which is the only sharing model compatible with the promise in the privacy
// policy that the numbers they enter are never sent to us.
// ─────────────────────────────────────────────────────────────────────────────

export type Params = Record<string, string | number>;

/**
 * Query string for a set of values, omitting any that match the default.
 *
 * The omission matters more than it looks: a link with eight parameters on it
 * reads as tracking, and a visitor who is on this site precisely because it
 * does not harvest anything will read it that way. Four short parameters look
 * like what they are.
 */
export function encodeParams(values: Params, defaults: Params): string {
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (String(value) !== String(defaults[key] ?? "")) {
      q.set(key, String(value));
    }
  }
  return q.toString();
}

/** Reads a numeric query parameter, returning null when absent or unusable. */
export function readNum(
  q: URLSearchParams,
  key: string,
  { min = 0, max = Number.MAX_SAFE_INTEGER }: { min?: number; max?: number } = {},
): number | null {
  const raw = q.get(key);
  if (raw === null) return null;
  const n = Number(raw.replace(/[^0-9.\-]/g, ""));
  if (!Number.isFinite(n) || n < min || n > max) return null;
  return n;
}

/**
 * Keeps the address bar in step with the calculator.
 *
 * replaceState rather than pushState, deliberately: a calculator that pushes
 * history on every keystroke turns the back button into a way of un-typing,
 * one character at a time, which is a genuinely hostile thing to do to someone
 * on a phone. This leaves the back button meaning "the page before this one".
 */
export function syncAddressBar(query: string): void {
  if (typeof window === "undefined") return;
  const next =
    window.location.pathname + (query ? `?${query}` : "") + window.location.hash;
  window.history.replaceState(null, "", next);
}

/**
 * Copies text, preferring the async clipboard API and falling back to a
 * hidden textarea.
 *
 * The fallback is not superstition: the clipboard API is unavailable in
 * insecure contexts and inside some in-app browsers, which is exactly where a
 * "Share" button on a phone gets pressed.
 */
export async function copyText(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to the legacy path rather than reporting failure.
    }
  }

  if (typeof document === "undefined") return false;

  try {
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "");
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}

/** Triggers a download of `text` as `filename`, entirely in the browser. */
export function downloadText(
  filename: string,
  text: string,
  mime = "text/csv;charset=utf-8",
): void {
  if (typeof document === "undefined") return;

  // The BOM is what makes Excel on Windows read this as UTF-8 rather than as
  // the local code page. Without it a dollar sign is fine and anything else
  // is not.
  const blob = new Blob(["\uFEFF", text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Revoked on a timer rather than immediately: Safari has been known to
  // cancel the download if the object URL disappears in the same tick.
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * Opens every collapsed <details> on the page, prints, then puts them back.
 *
 * Design guide §9 requires accordions to print open. CSS alone cannot reliably
 * force a closed <details> open across browsers, so this does it in the DOM —
 * which is also the only version that can be verified by looking at it. The
 * restore runs on the `afterprint` event, with a timer as a backstop for
 * browsers that never fire it.
 */
export function printPage(): void {
  if (typeof document === "undefined") return;

  const closed = Array.from(
    document.querySelectorAll<HTMLDetailsElement>("details:not([open])"),
  );
  closed.forEach((d) => {
    d.open = true;
  });

  let restored = false;
  const restore = () => {
    if (restored) return;
    restored = true;
    closed.forEach((d) => {
      d.open = false;
    });
    window.removeEventListener("afterprint", restore);
  };

  window.addEventListener("afterprint", restore);
  setTimeout(restore, 20000);

  window.print();
}
