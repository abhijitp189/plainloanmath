import type { Metadata } from "next";
import Link from "next/link";
import { LAST_REVIEWED } from "@/lib/constants";
import {
  PageHeader,
  ReviewMeta,
  breadcrumbSchema,
} from "@/components/PageChrome";
import { Band } from "@/components/CalcChrome";
import { CALC_ICON } from "@/components/CalcIcons";
import {
  CALCULATOR_KEYS,
  MORTGAGE_PATH,
  ROUTES,
  ROUTE_REVIEWED,
  navLabel,
  type CalculatorKey,
} from "@/lib/routes";

export const metadata: Metadata = {
  title: "Mortgage Calculators",
  description:
    "Every mortgage calculator on this site, each answering one question with the formula published underneath it. No lender pays us, and there are no rate quotes or lead forms anywhere.",
  alternates: { canonical: MORTGAGE_PATH },
};

const REVIEWED = ROUTE_REVIEWED.calculators ?? LAST_REVIEWED;

// ─────────────────────────────────────────────────────────────────────────────
// The /mortgage/ silo index, built August 19, 2026.
//
// ⚠️ THIS PAGE DEPENDS ON A CLOUDFLARE CHANGE. ⚠️ `/mortgage/` 301'd to `/`
// at the edge until this shipped. That rule has to be deleted in the dashboard
// or this page redirects away from itself while still sitting in the sitemap.
// See MORTGAGE_PATH in lib/routes.ts.
//
// WHY IT EXISTS, having deliberately not existed since August 9. Three reasons,
// and the third is the one that settled it:
//
//   1. `/learn/` has had an index since the day it shipped, so the site had one
//      silo with a front door and one without, and the one without held five of
//      its seven content pages.
//   2. The header carried two "All calculators" links, both hardcoded to "/",
//      because there was nowhere better to send them.
//   3. The homepage is a hub for the whole site, not for the calculators. It
//      spends its first screen on positioning, and a reader who already knows
//      what the site is and wants the list of tools should not have to read
//      past the sales argument to reach it.
//
// WHAT THIS PAGE IS NOT. It is not a second homepage and it does not repeat the
// positioning argument, the trust panel or the glossary. It lists the tools,
// says what each one answers, and gets out of the way.
//
// The list is CALCULATOR_KEYS, same as the header, the footer and the hub grid
// (technical brief §7.1, §7.2). The card copy is keyed over CalculatorKey, so a
// calculator added without copy is a compile error rather than a card that
// quietly never appears. That guard is the whole reason the hub lost a
// calculator for a day on August 18 and this page cannot.
//
// The copy here is deliberately NOT the hub's copy. The hub sells the click to
// someone deciding whether this site is worth their time; this page is read by
// someone who has already decided and is choosing between tools, so each entry
// leads with the question the tool answers and then says what makes its answer
// different from the one they will get elsewhere.
// ─────────────────────────────────────────────────────────────────────────────

const CARD: Record<CalculatorKey, { question: string; body: string }> = {
  payment: {
    question: "What will I actually pay each month?",
    body: "Principal, interest, property tax, homeowners insurance, mortgage insurance and HOA dues, separated rather than lumped into one number, so you can see which parts a rate can change and which it cannot.",
  },
  payoff: {
    question: "What happens if I pay more than I owe?",
    body: "Monthly extras, a yearly extra, a lump sum or a biweekly schedule, run against the same loan with nothing extra. Shows the month you cross from paying mostly interest to mostly principal, and what waiting a year costs.",
  },
  payoffVsInvest: {
    question: "Should I pay the loan down or invest the money?",
    body: "The same money put both ways, to the same end date, with the investment return you choose rather than one we picked. Reports where each path ends and the return at which they tie, and does not declare a winner.",
  },
  refinance: {
    question: "Is refinancing worth what it costs?",
    body: "The month a refinance pays back its closing costs, computed from cumulative interest rather than from the rule of thumb every other tool uses, plus the rate you would need to be offered for it to be worth doing at all.",
  },
  termCompare: {
    question: "Should I take the 15-year or the 30-year?",
    body: "Splits the interest saving into the part the shorter term actually causes and the part that comes from simply paying more, which you can do on either loan. On a typical loan most of the published figure turns out to be the second one.",
  },
};

export default function CalculatorIndexPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema("Calculators", MORTGAGE_PATH),
          ),
        }}
      />

      <PageHeader
        eyebrow="Calculators"
        title="Mortgage calculators"
        lede="One tool per page, each answering a single question, each with its formula written out underneath it. Every figure is computed in your own browser and nothing you type is sent anywhere."
        breadcrumb="Calculators"
        siblings={[
          { href: ROUTES.learn, label: "Learn" },
          { href: ROUTES.methodology, label: "How we calculate" },
          { href: ROUTES.corrections, label: "Corrections" },
        ]}
      />

      <Band tone="surface">
        {/* Two columns rather than three, matching the hub. Five cards leave
            the last one alone on its row, which is a list ending rather than
            the dead column §3.4 forbids. */}
        <ul className="grid gap-5 sm:grid-cols-2">
          {CALCULATOR_KEYS.map((key) => (
            <li key={key}>
              <Link
                href={ROUTES[key]}
                className="panel group flex h-full flex-col p-6 transition-colors duration-150 hover:border-accent"
              >
                <span
                  className="inline-flex h-11 w-11 items-center justify-center border border-line-strong text-ink"
                  aria-hidden="true"
                >
                  {CALC_ICON[key]}
                </span>
                <p className="label mt-4">{navLabel(key)}</p>
                <h2 className="mt-2 text-[1.2rem] font-bold leading-snug tracking-[-.02em] text-ink">
                  {CARD[key].question}
                </h2>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-2">
                  {CARD[key].body}
                </p>
                <p className="mt-4 text-[0.9rem] font-bold text-accent-dk">
                  Open it &rarr;
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </Band>

      <Band tone="paper">
        {/* §3.4: content on the left, content on the right. The right column
            carries the standing position rather than being left empty. */}
        <div className="grid gap-x-12 gap-y-8 lg:grid-cols-2 lg:items-start">
          <div className="max-w-prose">
            <p className="label">What none of these do</p>
            <p className="mt-3 text-ink-2">
              None of them ask for your name, your email or your phone number.
              None of them pass you to a lender, and none of them show you a
              rate quote, because nobody pays us to put one there. Every
              calculation runs on your device, which is not a promise we made so
              much as a consequence of the site having no accounts and no
              database to put anything in.
            </p>
          </div>
          <div className="max-w-prose">
            <p className="label">Some questions do not need a tool</p>
            <p className="mt-3 text-ink-2">
              Where the answer is arithmetic you read once rather than a number
              you type into, it goes in{" "}
              <Link
                href={ROUTES.learn}
                className="font-bold text-accent-dk underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
              >
                the explainers
              </Link>{" "}
              instead. Every formula used anywhere on the site is written out on{" "}
              <Link
                href={ROUTES.methodology}
                className="font-bold text-accent-dk underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
              >
                the methodology page
              </Link>
              , with its sources.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <ReviewMeta updated={REVIEWED} />
        </div>
      </Band>
    </>
  );
}
