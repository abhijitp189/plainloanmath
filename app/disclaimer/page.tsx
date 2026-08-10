import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer",
  description:
    "What Plain Loan Math is, what it is not, and the limits of the figures our calculators produce.",
  alternates: { canonical: "/disclaimer/" },
};

const LAST_UPDATED = "August 8, 2026";

export default function DisclaimerPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        Disclaimer
      </h1>
      <p className="mt-3 text-sm text-muted">Last updated: {LAST_UPDATED}</p>

      <div className="mt-8 border border-line bg-accent-soft px-5 py-4">
        <p className="text-ink-2">
          We publish arithmetic and explanations. We are not a lender, not a
          broker, not a licensed financial adviser, and we are not paid by
          anyone in the mortgage industry. Nothing here is advice about your
          particular situation.
        </p>
      </div>

      <Section title="Educational, not advisory">
        <p>
          Everything on this site is general information. We do not know your
          income, your credit history, your other debts, your tax position, or
          your plans — so nothing here can be a recommendation about what you
          should do. A calculator that has never met you cannot advise you.
        </p>
        <p>
          For advice about your own circumstances, speak to a licensed mortgage
          professional, a HUD-approved housing counselor, or a financial
          professional who is
          able to look at the whole picture.
        </p>
      </Section>

      <Section title="What our numbers actually cover">
        <p>
          Our calculators model principal and interest using standard monthly
          amortization. Unless a page says otherwise, the figures exclude
          property taxes, homeowners insurance, mortgage insurance, HOA dues,
          closing costs, origination fees, points, and prepayment penalties.
        </p>
        <p>
          Those excluded items are often a large share of what you actually pay
          each month. A payment figure from this site is therefore smaller than
          the amount that will leave your bank account.
        </p>
        <p>
          We also assume a fixed interest rate held for the whole term, and
          payments made on schedule. Adjustable-rate loans, missed payments,
          recasts, and refinancing all change the outcome.
        </p>
      </Section>

      <Section title="Accuracy and errors">
        <p>
          We show the formula behind each calculation so you can check our work
          rather than take it on trust. We test the arithmetic against
          published reference figures. Even so, errors are possible — in the
          code, in the explanation, or in a source we relied on.
        </p>
        <p>
          If you find something wrong,{" "}
          <a
            className="text-accent underline underline-offset-2 hover:text-accent-dk"
            href="/contact/"
          >
            tell us
          </a>{" "}
          and we will correct it and note the correction. Do not rely on any
          figure from this site for a decision that matters without confirming
          it with your lender.
        </p>
      </Section>

      <Section title="No relationship is created">
        <p>
          Using this site does not create any professional, advisory, or
          fiduciary relationship between you and us. We do not collect
          applications, do not pass your details to lenders, and do not receive
          payment for referrals.
        </p>
      </Section>

      <Section title="Where our information comes from">
        <p>
          Where we cite rules, limits, or figures, we use primary sources such
          as the Consumer Financial Protection Bureau, the Federal Housing
          Finance Agency, HUD, the IRS, and Freddie Mac. Those rules change.
          Anything you read here reflects our understanding at the date shown,
          and we may not have updated it since.
        </p>
      </Section>

      <Section title="United States focus">
        <p>
          This site describes United States mortgage conventions — monthly
          compounding, fixed-rate amortization, and US loan products. If you are
          borrowing in another country, the arithmetic on this site may not
          match how your lender calculates interest.
        </p>
      </Section>

      <Section title="External links">
        <p>
          We link to outside sources because you should be able to check what we
          say. We do not control those sites and are not responsible for their
          content or their accuracy.
        </p>
      </Section>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10 border-t border-line pt-8">
      <h2 className="text-xl font-semibold tracking-tight text-ink">{title}</h2>
      <div className="mt-4 space-y-4 text-ink-2">{children}</div>
    </section>
  );
}
