"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES, CALCULATOR_KEYS, navLabel } from "@/lib/routes";

// ─────────────────────────────────────────────────────────────────────────────
// The menu bar.
//
// Structure borrowed from taiyarho.in, which solves the same problem at much
// larger scale: ONE dropdown absorbs the deep set, and the rest of the bar
// carries sections rather than individual items. There, 101 exams collapse
// into a single "Exams" menu. Here, every calculator collapses into
// "Calculators" — which means shipping tools three through six changes this
// file by one array entry each, not by restructuring the header.
//
// What was deliberately NOT copied: that site runs seven top-level items, a
// search box and a translate control, and it earns them across hundreds of
// pages. This site has twelve. Every header link fires from every page, so a
// bar wider than the site is deep spreads internal links thin and promises
// depth that is not there. Search is worth revisiting past ~40 pages.
//
// WHY THIS IS A CLIENT COMPONENT. It was server-rendered with zero JavaScript,
// and giving that up was a real cost against a bundle already over budget. A
// pure <details> menu would have kept it, but <details> cannot close on an
// outside tap, on Escape, or on navigation — so the panel would sit open over
// the page after a visitor tapped a link. On a sticky header that appears on
// every page, that reads as broken.
//
// THE BUG THIS FIXES. The old header was a single flex row at every width,
// with no wrap, no shrink and nothing containing the overflow. At 375px it
// needed roughly 616px, so every page on the site scrolled sideways on a
// phone — for a visitor the design guide describes as "usually on a phone."
// ─────────────────────────────────────────────────────────────────────────────

type Item = { href: string; label: string; icon: React.ReactNode };

const ICON = {
  payment: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="0" />
      <circle cx="12" cy="12" r="2.6" />
      <path d="M6.5 12h.01M17.5 12h.01" />
    </>
  ),
  payoffVsInvest: (
    <>
      <path d="M12 4v16" />
      <path d="M4 8h6M14 8h6" />
      <path d="M7 8l-3 5h6zM17 8l-3 5h6z" />
    </>
  ),
  payoff: (
    <>
      <path d="M4 7c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3z" />
      <path d="M4 7v5c0 1.7 3.6 3 8 3s8-1.3 8-3V7" />
      <path d="M4 12v5c0 1.7 3.6 3 8 3s8-1.3 8-3v-5" />
    </>
  ),
  methodology: (
    <>
      <path d="M4 5h16v14H4z" />
      <path d="M8 9h8M8 13h8M8 17h5" />
    </>
  ),
  about: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v6M12 7.5v.01" />
    </>
  ),
  contact: (
    <>
      <path d="M3 6h18v12H3z" />
      <path d="M3 7l9 6 9-6" />
    </>
  ),
};

// This file owns only the ICONS and their presentation. The set of calculators,
// their order and their labels all come from lib/routes.ts — CALCULATOR_KEYS for
// the order and navLabel() for the text — so the header, the footer and the hub
// read one source and cannot drift (§0.13). Adding a calculator is one entry in
// CALCULATOR_KEYS plus an icon here, on the day its page ships (project brief §3,
// defect 3 — the site once shipped nine links to routes that did not exist).
const CALCULATORS: Item[] = CALCULATOR_KEYS.map((key) => ({
  href: ROUTES[key],
  label: navLabel(key),
  icon: ICON[key],
}));

const SECTIONS: Item[] = [
  { href: ROUTES.methodology, label: "Methodology", icon: ICON.methodology },
  { href: ROUTES.about, label: "About", icon: ICON.about },
  { href: ROUTES.contact, label: "Contact", icon: ICON.contact },
];

function RowIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      className="shrink-0 text-accent"
    >
      {children}
    </svg>
  );
}

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const pathname = usePathname();

  const headerRef = useRef<HTMLElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);

  // Close on navigation. Without this the panel stays open over the new page,
  // because the header persists across client-side route changes.
  useEffect(() => {
    setMenuOpen(false);
    setDropOpen(false);
  }, [pathname]);

  // Close on an outside tap or on Escape — the two behaviors a plain <details>
  // cannot do, and the reason this component ships JavaScript at all.
  useEffect(() => {
    if (!menuOpen && !dropOpen) return;

    function onPointer(e: PointerEvent) {
      if (!headerRef.current?.contains(e.target as Node)) {
        setMenuOpen(false);
        setDropOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      setMenuOpen(false);
      setDropOpen(false);
      burgerRef.current?.focus();
    }

    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen, dropOpen]);

  const isCalcPage = CALCULATORS.some((c) => pathname?.startsWith(c.href));

  return (
    <header
      ref={headerRef}
      data-site-header
      className="sticky top-0 z-40 border-b-rule border-line-strong bg-surface"
    >
      <div className="mx-auto flex max-w-wrap items-center justify-between gap-4 px-[var(--gutter)] py-3">
        <Link
          href="/"
          className="group flex min-h-tap items-center gap-2.5"
          aria-label="Plain Loan Math — home"
        >
          {/* The mark is the loan-life strip in miniature: interest-heavy on
              the left, principal-heavy on the right. */}
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="shrink-0"
          >
            <rect
              x="2"
              y="9"
              width="2.4"
              height="11"
              fill="var(--c-interest)"
            />
            <rect x="6" y="7" width="2.4" height="13" fill="#3F7F86" />
            <rect x="10" y="5.5" width="2.4" height="14.5" fill="#2A8F7B" />
            <rect x="14" y="4" width="2.4" height="16" fill="var(--c-pi-2)" />
            <rect
              x="18"
              y="2.5"
              width="2.4"
              height="17.5"
              fill="var(--accent)"
            />
          </svg>
          <span className="text-[1.05rem] font-extrabold tracking-[-.025em] text-ink">
            Plain Loan Math
          </span>
        </Link>

        {/* ── Desktop bar ─────────────────────────────────────────────
            Hidden below 640px, where it needs almost twice the width the
            viewport has. */}
        <nav aria-label="Main" className="hidden sm:block">
          <ul className="flex items-center gap-1 text-[0.92rem]">
            <li className="relative">
              <button
                type="button"
                onClick={() => setDropOpen((o) => !o)}
                aria-expanded={dropOpen}
                aria-controls="calc-menu"
                className={`flex min-h-tap items-center gap-1.5 px-3 transition-colors duration-150 hover:bg-accent-soft hover:text-accent-dk ${
                  isCalcPage ? "font-bold text-accent-dk" : "text-ink-2"
                }`}
              >
                Calculators
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.6"
                  strokeLinecap="square"
                  aria-hidden="true"
                  className={`transition-transform duration-150 ${
                    dropOpen ? "rotate-180" : ""
                  }`}
                >
                  <path d="M5 9l7 7 7-7" />
                </svg>
              </button>

              <ul
                id="calc-menu"
                hidden={!dropOpen}
                className="absolute right-0 top-full z-50 mt-2 w-[19rem] border border-line-strong bg-surface py-1"
              >
                {CALCULATORS.map((c) => (
                  <li key={c.href}>
                    <Link
                      href={c.href}
                      className="flex min-h-tap items-center gap-3 px-4 text-ink-2 transition-colors duration-150 hover:bg-accent-soft hover:text-accent-dk"
                    >
                      <RowIcon>{c.icon}</RowIcon>
                      {c.label}
                    </Link>
                  </li>
                ))}
                <li className="mt-1 border-t border-line">
                  <Link
                    href="/"
                    className="flex min-h-tap items-center px-4 text-[0.88rem] font-bold text-accent-dk transition-colors duration-150 hover:bg-accent-soft"
                  >
                    All calculators &rarr;
                  </Link>
                </li>
              </ul>
            </li>

            {SECTIONS.slice(0, 2).map((s) => (
              <li key={s.href}>
                <Link
                  href={s.href}
                  className={`flex min-h-tap items-center px-3 transition-colors duration-150 hover:bg-accent-soft hover:text-accent-dk ${
                    pathname === s.href
                      ? "font-bold text-accent-dk"
                      : "text-ink-2"
                  }`}
                >
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* ── Mobile toggle ──────────────────────────────────────── */}
        <button
          ref={burgerRef}
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="-mr-2 flex h-11 w-11 items-center justify-center text-ink transition-colors duration-150 hover:bg-accent-soft sm:hidden"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="square"
            aria-hidden="true"
          >
            {menuOpen ? (
              <path d="M5 5l14 14M19 5L5 19" />
            ) : (
              <path d="M3.5 7h17M3.5 12h17M3.5 17h17" />
            )}
          </svg>
        </button>
      </div>

      {/* ── Mobile panel ─────────────────────────────────────────────
          A sheet below the bar rather than a full-screen takeover, so the page
          stays visible behind it and there is no scroll lock to get wrong.
          Rows are grouped: tools, rule, site pages, then one primary action. */}
      {/* Rendered always, shown conditionally. Mounting it only when open
          would keep every calculator link out of the static HTML until after
          hydration — the footer carries them too, but a menu whose contents
          do not exist without JavaScript is the wrong default on a site whose
          pages are otherwise fully server-rendered. `hidden` also removes the
          links from the accessibility tree and the tab order while closed. */}
      <nav
        id="mobile-menu"
        aria-label="Menu"
        hidden={!menuOpen}
        className="border-t border-line bg-surface px-[var(--gutter)] pb-4 pt-2 sm:hidden"
      >
        <ul>
          {CALCULATORS.map((c) => (
            <li key={c.href}>
              <Link
                href={c.href}
                className={`flex min-h-[52px] items-center gap-3.5 text-[1rem] transition-colors duration-150 hover:text-accent-dk ${
                  pathname?.startsWith(c.href)
                    ? "font-bold text-accent-dk"
                    : "text-ink"
                }`}
              >
                <RowIcon>{c.icon}</RowIcon>
                {c.label}
              </Link>
            </li>
          ))}
        </ul>

        <ul className="mt-1 border-t border-line pt-1">
          {SECTIONS.map((s) => (
            <li key={s.href}>
              <Link
                href={s.href}
                className={`flex min-h-[52px] items-center gap-3.5 text-[1rem] transition-colors duration-150 hover:text-accent-dk ${
                  pathname === s.href ? "font-bold text-accent-dk" : "text-ink"
                }`}
              >
                <RowIcon>{s.icon}</RowIcon>
                {s.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link href="/" className="btn btn-primary mt-3 w-full">
          All calculators &rarr;
        </Link>
      </nav>
    </header>
  );
}
