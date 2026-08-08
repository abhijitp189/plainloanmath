import Link from "next/link";

// The homepage is the hub — it holds the payment calculator and the tool grid.
// There is deliberately no /mortgage/ nav item: that path 301s to "/" at the
// Cloudflare edge, because a hub page there would target the same query as the
// homepage and split whatever authority the site earns.
const NAV = [
  { href: "/mortgage/payoff-with-extra-payments/", label: "Payoff calculator" },
  { href: "/methodology/", label: "Methodology" },
  { href: "/disclaimer/", label: "Disclaimer" },
];

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-wrap items-center justify-between gap-4 px-[var(--gutter)] py-3">
        <Link
          href="/"
          className="group flex min-h-tap items-center gap-2.5"
          aria-label="Plain Loan Math — home"
        >
          {/* The mark is the loan-life strip in miniature: interest-heavy on
              the left, principal-heavy on the right. Same idea as the
              signature chart, at 20px. */}
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="shrink-0"
          >
            <rect x="2" y="9" width="2.4" height="11" fill="var(--c-interest)" />
            <rect x="6" y="7" width="2.4" height="13" fill="#3F7F86" />
            <rect x="10" y="5.5" width="2.4" height="14.5" fill="#2A8F7B" />
            <rect x="14" y="4" width="2.4" height="16" fill="var(--c-pi-2)" />
            <rect x="18" y="2.5" width="2.4" height="17.5" fill="var(--accent)" />
          </svg>
          <span className="text-[1.02rem] font-semibold tracking-tight text-ink">
            Plain Loan Math
          </span>
        </Link>

        <nav aria-label="Main">
          <ul className="flex items-center gap-1 text-[0.92rem]">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex min-h-tap items-center rounded-lg px-2.5 text-ink-2 transition-colors duration-150 hover:bg-accent-soft hover:text-accent-dk sm:px-3"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
