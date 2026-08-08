import Link from "next/link";
import { SITE } from "@/lib/constants";

// Light footer, deliberately. Design guide §3.2: the dark band is spent once
// per page on the no-lender-money statement, and a dark footer on top of it
// made an earlier version feel gloomy.

const COLUMNS: { heading: string; links: { href: string; label: string }[] }[] =
  [
    {
      heading: "Calculators",
      links: [
        { href: "/", label: "Monthly payment" },
        {
          href: "/mortgage/payoff-with-extra-payments/",
          label: "Payoff with extra payments",
        },
      ],
    },
    {
      heading: "How this works",
      links: [
        { href: "/methodology/", label: "Methodology" },
        { href: "/corrections/", label: "Corrections" },
        { href: "/editorial-policy/", label: "Editorial policy" },
      ],
    },
    {
      heading: "Site",
      links: [
        { href: "/about/", label: "About" },
        { href: "/contact/", label: "Contact" },
      ],
    },
    {
      heading: "Legal",
      links: [
        { href: "/disclaimer/", label: "Disclaimer" },
        { href: "/privacy/", label: "Privacy" },
        { href: "/terms/", label: "Terms" },
      ],
    },
  ];

export default function SiteFooter() {
  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto max-w-wrap px-[var(--gutter)] py-10">
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h2 className="text-[11px] font-bold uppercase tracking-[.13em] text-muted">
                {col.heading}
              </h2>
              <ul className="mt-3 space-y-1">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="flex min-h-tap items-center text-[0.93rem] text-ink-2 transition-colors duration-150 hover:text-accent-dk hover:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-9 border-t border-line pt-6">
          <p className="max-w-prose text-[0.88rem] leading-relaxed text-muted">
            {SITE.name} is not a lender, a broker, or a lead generator. No
            lender pays us, there are no rate quotes or lead forms anywhere on
            this site, and every calculation runs in your browser — the numbers
            you enter are never sent to us and never stored. Everything here is
            an estimate for education, not financial advice.
          </p>
          <p className="mt-4 text-[0.88rem] text-muted">
            <a
              href={`mailto:${SITE.email}`}
              className="text-accent-dk hover:underline"
            >
              {SITE.email}
            </a>
            <span className="mx-2 text-line-strong" aria-hidden="true">
              ·
            </span>
            <span className="num">
              &copy; {new Date().getFullYear()} {SITE.name}
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
