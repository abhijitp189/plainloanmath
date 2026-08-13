import type { Metadata } from "next";
import {
  LAST_REVIEWED,
  SITE,
  EXAMPLE,
  RETURN_TIERS,
  RETURN_DEFAULT_PCT,
  RETURN_SOURCE,
} from "@/lib/constants";
import PayoffVsInvestCalculator from "@/components/PayoffVsInvestCalculator";
import { SectionHead } from "@/components/PageChrome";
import {
  Band,
  calcBreadcrumbSchema,
  CalcFooter,
  CalcStripe,
  EditorialCols,
  FaqBlock,
  faqSchema,
  Sources,
  Sub,
  type Faq,
} from "@/components/CalcChrome";
import {
  PAYOFF_VS_INVEST_PATH,
  ROUTE_REVIEWED,
  relatedRoutes,
} from "@/lib/routes";
import { formatUSD, formatDuration } from "@/lib/mortgage";
import { payoffVsInvest } from "@/lib/investing";

export const metadata: Metadata = {
  title: "Pay Off Mortgage or Invest Calculator",
  description:
    "Compare paying your mortgage down against investing the same money each month. Computes the exact return at which the two come out level for your own loan, and never tells you which to pick.",
  alternates: { canonical: PAYOFF_VS_INVEST_PATH },
};

const REVIEWED = ROUTE_REVIEWED.payoffVsInvest ?? LAST_REVIEWED;

// ─────────────────────────────────────────────────────────────────────────────
// The worked example, computed at build time.
//
// Project brief §10: worked examples are computed, not typed, so the prose
// cannot drift from the tool. Every figure below comes out of lib/investing.ts
// during the build, using the site-wide recurring example — $340,000 at 6.75%
// over 30 years, which is a $425,000 home with 20% down.
//
// Independently recomputed in Node on August 13, 2026 against a separate
// implementation written from the algebra rather than by importing this one:
// zero difference across seven loan shapes.
// ─────────────────────────────────────────────────────────────────────────────

const P = EXAMPLE.loanAmount;
const R = EXAMPLE.annualRatePct;
const N = EXAMPLE.termYears * 12;
const SPARE = 250;

const EX = payoffVsInvest(P, R, N, SPARE, RETURN_DEFAULT_PCT);
const EX_LOW = payoffVsInvest(P, R, N, SPARE, RETURN_TIERS[0].pct);
const EX_HIGH = payoffVsInvest(P, R, N, SPARE, RETURN_TIERS[2].pct);

const CROSSOVER = EX.crossoverPct;
const EFFECTIVE = EX.effectiveMortgagePct;

const FAQ: Faq[] = [
  {
    q: "Should I pay off my mortgage or invest the money?",
    a: `That depends on a return nobody can know in advance, so this page will not pick for you. What it can do is compute the return at which the two come out level for your own loan. On the example loan, ${P.toLocaleString("en-US")} dollars at ${R}% with ${formatUSD(SPARE)} a month spare, both paths end level at a return of ${CROSSOVER!.toFixed(2)}%. Above that, investing ends ahead. Below it, paying down does.`,
  },
  {
    q: "Is it better to pay off my mortgage or invest if my rate is low?",
    a: "The lower your rate, the lower the return an investment has to beat, so the tie point falls with it. At a rate near zero there is no tie point at all, because carrying the loan costs you almost nothing. Enter your own rate above and the tie point moves with it.",
  },
  {
    q: "What return do I need to beat my mortgage rate?",
    a: `More than your rate, and this is the part most calculators get wrong. A mortgage rate is quoted as a yearly figure but charged monthly, so ${R}% actually costs ${EFFECTIVE.toFixed(2)}% over a year. The tie point sits near that number, not the one printed on your statement. On the example loan it is ${CROSSOVER!.toFixed(2)}%.`,
  },
  {
    q: "Why is the tie point higher than my interest rate?",
    a: "Two different conventions are being compared. Your mortgage rate is a nominal annual rate compounded monthly. An investment average annual return is already a compounded, effective figure. Putting the two side by side without converting compares different units, which sets the bar too low.",
  },
  {
    q: "Does this account for tax?",
    a: "No. Every figure here is before tax on both sides. If you itemize, mortgage interest may be deductible, which lowers the real cost of the loan and pushes the tie point down. Tax on investment gains pushes it back up. The two work in opposite directions and partly offset, but this calculator does not model either.",
  },
  {
    q: "Does this account for inflation?",
    a: "No. The mortgage rate you enter and the return you enter are both nominal, meaning neither is adjusted for inflation. Keeping both in the same units is what makes the comparison valid. A real, inflation-adjusted return would have to be compared against a real mortgage rate.",
  },
  {
    q: "What return should I enter?",
    a: `The three starting points are what each mix actually returned from 1928 to 2025, before tax and before inflation: ${RETURN_TIERS.map((t) => `${t.pct.toFixed(1)}% for ${t.label.toLowerCase()}`).join(", ")}. They are history, not a forecast. The past does not commit the future to anything, which is exactly why the field is yours to change.`,
  },
  {
    q: "Is paying down the mortgage guaranteed?",
    a: "Money put against the loan removes interest that would definitely have been charged, so that part is certain. An investment return is not. These are two different kinds of number and this page does not pretend otherwise: it reports both outcomes and leaves the judgment about risk to you.",
  },
  {
    q: "What if I have other debt or no emergency savings?",
    a: "This calculator compares exactly two uses of spare money and knows nothing about the rest of your finances. Higher-rate debt and a cash buffer are choices sitting outside this comparison entirely.",
  },
  {
    q: "When do the two paths get compared?",
    a: `At the month the loan would have ended on its own, month ${N} on a ${EXAMPLE.termYears}-year loan. By then both paths owe nothing, so the only difference left is what has been invested. Comparing at an earlier date would mean subtracting a leftover balance from one side and not the other.`,
  },
  {
    q: "Does paying down the mortgage stop me investing?",
    a: `No, and the calculator assumes it does not. Once the loan clears, the whole payment goes into investments instead. On the example loan that happens in ${formatDuration(EX.payDown.payoffMonth!)}, leaving ${formatDuration(N - EX.payDown.payoffMonth!)} of investing the full amount.`,
  },
  {
    q: "Do you make money if I choose one over the other?",
    a: "No. No lender, broker, or investment firm pays this site anything, there are no lead forms, and nothing here links out to a product. That is why the page can report both numbers and stop.",
  },
];

const appSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Pay Off Mortgage or Invest Calculator",
  url: `${SITE.url}${PAYOFF_VS_INVEST_PATH}`,
  applicationCategory: "FinanceApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
};

const SIBLINGS = relatedRoutes("payoffVsInvest");

export default function PayoffVsInvestPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(FAQ)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(calcBreadcrumbSchema("payoffVsInvest")),
        }}
      />

      <CalcStripe
        route="payoffVsInvest"
        title="Pay off your mortgage, or invest the money instead"
        lede="Put the same amount either way and see where each one ends. The tool computes the exact return at which the two come out level for your loan, and it will not tell you which to choose."
        asideTitle="What this does"
        asidePoints={[
          "Updates as you type, nothing to submit",
          "Computes the return where both paths tie",
          "Reports both outcomes, never a winner",
          "No lender or investment firm pays us",
        ]}
      >
        <PayoffVsInvestCalculator />
      </CalcStripe>

      {/* ── What the comparison actually is ─────────────────────────── */}
      <Band tone="paper">
        <SectionHead
          title="What is being compared"
          intro="Both paths spend the same amount every month. The only difference is where it goes."
        />

        <EditorialCols
          left={
            <>
              <p>
                You have some money spare each month. You can put it against
                the mortgage, or you can invest it. This page runs both and
                shows where each one ends up.
              </p>
              <Sub>Paying the mortgage down</Sub>
              <p>
                Your spare money goes on top of the scheduled payment every
                month. The balance falls faster, so less interest is charged,
                so the loan clears early. From that month on you owe nothing,
                and the whole payment goes into investments instead.
              </p>
              <Sub>Investing instead</Sub>
              <p>
                You pay the mortgage exactly as scheduled and put the spare
                money into investments from the first month. The loan runs its
                full term. The investments have longer to compound.
              </p>
            </>
          }
          right={
            <>
              <Sub>Why the comparison ends where it does</Sub>
              <p>
                Both paths are compared at month{" "}
                <span className="num">{N}</span>, the month the loan would have
                ended on its own. That matters. By then neither path owes
                anything, so the only difference left is the investment
                balance, and the two figures can be set beside each other
                honestly.
              </p>
              <p>
                Comparing at an earlier date would mean one path still has a
                mortgage and the other does not. Tools that skip this step
                flatter whichever side they subtract the leftover balance from.
              </p>
              <Sub>The same money, both times</Sub>
              <p>
                Neither path spends more than the other in any month. That is
                what makes this a fair comparison rather than a comparison
                between saving hard and saving less.
              </p>
            </>
          }
        />
      </Band>

      {/* ── The worked example ──────────────────────────────────────── */}
      <Band tone="surface">
        <SectionHead
          title="The same loan, at three different returns"
          intro={`A ${formatUSD(P)} loan at ${R}% over ${EXAMPLE.termYears} years, with ${formatUSD(SPARE)} a month spare. Every figure below is computed by the same engine the calculator uses.`}
        />

        <div className="mt-6 overflow-x-auto" data-print-full>
          <table className="w-full min-w-[34rem] border-collapse text-[0.92rem]">
            <caption className="sr-only">
              Where each path ends at month {N}, at three different assumed
              returns
            </caption>
            <thead>
              <tr className="border-b-rule border-line-strong bg-paper-2">
                <th className="label px-3 py-2.5 text-left">
                  Assumed annual return
                </th>
                <th className="label px-3 py-2.5 text-right">Paying down</th>
                <th className="label px-3 py-2.5 text-right">Investing</th>
                <th className="label px-3 py-2.5 text-right">Difference</th>
              </tr>
            </thead>
            <tbody>
              {[
                { t: RETURN_TIERS[0], o: EX_LOW },
                { t: RETURN_TIERS[1], o: EX },
                { t: RETURN_TIERS[2], o: EX_HIGH },
              ].map(({ t, o }) => (
                <tr key={t.key} className="border-b border-line">
                  <td className="px-3 py-2.5">
                    <span className="num font-bold">{t.pct.toFixed(1)}%</span>{" "}
                    <span className="text-muted">{t.label}</span>
                  </td>
                  <td className="num px-3 py-2.5 text-right">
                    {formatUSD(o.payDown.net)}
                  </td>
                  <td className="num px-3 py-2.5 text-right">
                    {formatUSD(o.invest.net)}
                  </td>
                  <td className="num px-3 py-2.5 text-right">
                    {formatUSD(Math.abs(o.invest.net - o.payDown.net))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 max-w-prose text-[0.88rem] leading-relaxed text-muted">
          The three returns are what each mix returned from 1928 to 2025, before
          tax and before inflation. They are starting points for the field, not
          predictions. All figures are our own calculation.
        </p>

        <div className="mt-8">
          <EditorialCols
            left={
              <>
                <Sub>The number that decides it</Sub>
                <p>
                  Rather than argue about which return is right, the calculator
                  computes the one that matters: the return at which both paths
                  end level. On this loan that is{" "}
                  <span className="num font-bold text-ink">
                    {CROSSOVER!.toFixed(2)}%
                  </span>
                  . Above it, investing ends ahead. Below it, paying down does.
                </p>
                <p>
                  That converts an argument about the future into a fact about
                  your own loan. You still have to judge whether you can beat{" "}
                  <span className="num">{CROSSOVER!.toFixed(2)}%</span>, but at
                  least you know what you are judging.
                </p>
              </>
            }
            right={
              <>
                <Sub>Why it is not your interest rate</Sub>
                <p>
                  The familiar rule of thumb says to invest if you can beat your
                  mortgage rate. That sets the bar too low, and the reason is a
                  units mismatch.
                </p>
                <p>
                  Your rate is quoted per year but charged every month, so{" "}
                  <span className="num">{R}%</span> compounds to{" "}
                  <span className="num font-bold text-ink">
                    {EFFECTIVE.toFixed(2)}%
                  </span>{" "}
                  over a year. An investment average annual return is already a
                  compounded figure. Comparing the two raw numbers compares
                  different things.
                </p>
              </>
            }
          />
        </div>
      </Band>

      {/* ── Before you act ──────────────────────────────────────────── */}
      <Band tone="paper">
        <SectionHead
          title="Before you act"
          intro="Two numbers of the same size are not always the same kind of number."
        />

        <EditorialCols
          left={
            <>
              <Sub>One side is certain and the other is not</Sub>
              <p>
                Money put against the loan removes interest that would
                definitely have been charged. That saving is fixed the moment
                you make the payment.
              </p>
              <p>
                An investment return is an average looked at afterward. The
                same average can arrive as a steady climb or as a decade of
                nothing followed by a surge, and the order changes what you
                actually end up with. This calculator applies your return
                evenly, which no real market does.
              </p>
              <Sub>Money against a loan is hard to get back</Sub>
              <p>
                An extra payment reduces what you owe. It does not build a pot
                you can draw on if the roof goes. Getting it back generally
                means borrowing against the home again, on whatever terms are
                available then.
              </p>
            </>
          }
          right={
            <>
              <Sub>Check for a prepayment penalty</Sub>
              <p>
                Some mortgages charge a fee for paying down early. If yours
                does, that fee comes off the paying-down side and is not
                modeled here. It will be in your loan documents.
              </p>
              <Sub>Your servicer has to be told</Sub>
              <p>
                An extra amount sent without instructions may be held or
                applied to next month rather than to the balance. Money applied
                to principal is the only kind that does what this page assumes.
              </p>
              <Sub>This is not everything you could do</Sub>
              <p>
                Higher-rate debt, an emergency buffer, and an employer
                retirement match all sit outside this comparison. The
                calculator compares exactly two uses of spare money and knows
                nothing about the rest of your situation.
              </p>
            </>
          }
        />
      </Band>

      {/* ── What this leaves out ────────────────────────────────────── */}
      <Band tone="surface">
        <SectionHead
          title="What this calculator leaves out"
          intro="Every assumption that could move the answer, stated plainly."
        />

        <EditorialCols
          left={
            <>
              <Sub>Tax, on both sides</Sub>
              <p>
                Every figure is before tax. If you itemize, mortgage interest
                may be deductible, which lowers the real cost of the loan and
                pushes the tie point down. Tax on investment gains pushes it
                back up. The two pull in opposite directions and partly cancel,
                but neither is modeled.
              </p>
              <Sub>Inflation</Sub>
              <p>
                Both the rate and the return are nominal, meaning neither is
                adjusted for inflation. Keeping both in the same units is what
                makes the comparison valid.
              </p>
              <Sub>Fees</Sub>
              <p>
                Investment costs are not deducted. A fund charging a percentage
                each year reduces the return you should enter.
              </p>
            </>
          }
          right={
            <>
              <Sub>A steady return</Sub>
              <p>
                The return is applied evenly every month. Real markets do not
                behave that way, and the order in which gains and losses arrive
                changes the result.
              </p>
              <Sub>How the months are counted</Sub>
              <p>
                Interest accrues monthly on the balance, the payment is applied
                at the end of each month, and there is no mid-month
                proration. A year is twelve payments. Money invested is added at
                the end of each month too, so neither side gets a head start.
              </p>
              <Sub>Nothing changing</Sub>
              <p>
                The rate, the payment, and the amount you have spare all stay
                the same for the whole term. Over{" "}
                <span className="num">{EXAMPLE.termYears}</span> years, none of
                them will.
              </p>
            </>
          }
        />
      </Band>

      {/* ── FAQ ─────────────────────────────────────────────────────── */}
      <Band tone="paper">
        <SectionHead
          title="Questions people ask"
          intro="Short answers, with the arithmetic behind them where a number belongs."
        />
        <FaqBlock items={FAQ} />
      </Band>

      {/* ── Sources ─────────────────────────────────────────────────── */}
      <Band tone="surface">
        <Sources
          items={[
            {
              label: RETURN_SOURCE.label,
              url: RETURN_SOURCE.url,
              verified: RETURN_SOURCE.verified,
            },
            {
              label: "CFPB on prepayment penalties",
              url: "https://www.consumerfinance.gov/ask-cfpb/what-is-a-prepayment-penalty-en-1957/",
              verified: "2026-08-13",
            },
            {
              label: "Regulation Z, 12 CFR 1026.43 (prepayment penalties)",
              url: "https://www.ecfr.gov/current/title-12/chapter-X/part-1026/subpart-E/section-1026.43",
              verified: "2026-08-13",
            },
          ]}
        />
      </Band>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <Band tone="paper">
        <CalcFooter siblings={SIBLINGS} reviewed={REVIEWED} />
      </Band>
    </main>
  );
}
