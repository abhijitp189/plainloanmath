import Link from "next/link";
import { ROUTES, CALCULATOR_KEYS, navLabel } from "@/lib/routes";
import { SITE } from "@/lib/constants";

// Light footer, deliberately. Design guide §3.2: the dark band is spent once
// per page on the no-lender-money statement, and a dark footer on top of it
// made an earlier version feel gloomy.

const COLUMNS: { heading: string; links: { href: string; label: string }[] }[] =
  [
    {
      heading: "Calculators",
      // Every live calculator, from the one list in lib/routes.ts. Hand-typing
      // this column is how it came to be missing "Pay off or invest" after that
      // calculator shipped into the header and the hub but not here (§0.13).
      links: CALCULATOR_KEYS.map((key) => ({
        href: ROUTES[key],
        label: navLabel(key),
      })),
    },
    {
      heading: "How this works",
      links: [
        { href: ROUTES.learn, label: "Learn" },
        { href: ROUTES.methodology, label: "Methodology" },
        { href: ROUTES.corrections, label: "Corrections" },
        { href: ROUTES.editorialPolicy, label: "Editorial policy" },
      ],
    },
    {
      heading: "Site",
      links: [
        { href: ROUTES.about, label: "About" },
        { href: ROUTES.contact, label: "Contact" },
      ],
    },
    {
      heading: "Legal",
      links: [
        { href: ROUTES.disclaimer, label: "Disclaimer" },
        { href: ROUTES.privacy, label: "Privacy" },
        { href: ROUTES.terms, label: "Terms" },
      ],
    },
  ];

export default function SiteFooter() {
  return (
    <footer className="border-t-rule border-line-strong bg-paper">
      <div className="mx-auto max-w-wrap px-[var(--gutter)] py-10">
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h2 className="label">
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

        <div className="mt-9 border-t-rule border-line-strong pt-6">
          <p className="max-w-prose text-[0.88rem] leading-relaxed text-muted">
            {SITE.name} is not a lender, a broker, or a lead generator. No
            lender pays us, there are no rate quotes or lead forms anywhere on
            this site, and every calculation runs in your browser, and the numbers
            you enter are never sent to us and never stored. Everything here is
            an estimate for education, not financial advice.
          </p>
          <p className="mt-4 text-[0.88rem] text-muted">
            <span className="num">
              &copy; {new Date().getFullYear()} {SITE.name}
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
