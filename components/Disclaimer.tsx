import { InlineLink } from "@/components/InlineLink";
import { ROUTES } from "@/lib/routes";

/**
 * Sits at the bottom of every calculator and every page that produces a
 * number. Deliberately plain rather than alarming — it states what the tool
 * is and is not, which is both the honest framing and the one that keeps the
 * site clear of regulated financial-advice territory.
 */
export default function Disclaimer() {
  return (
    <aside className="mt-12 border-l-[3px] border-line-strong bg-paper px-5 py-4 text-sm text-muted">
      <p>
        <strong className="font-semibold text-ink-2">
          This is an estimate, not advice.
        </strong>{" "}
        Plain Loan Math is not a lender, broker, or licensed financial adviser,
        and no lender pays us. These figures are illustrations produced by the
        formula shown on the page. Your actual loan will depend on your
        lender&rsquo;s terms, fees, taxes, and insurance. Check any number that
        matters with your lender before acting on it.
      </p>
      <p className="mt-3">
        <InlineLink href={ROUTES.disclaimer}>Full disclaimer</InlineLink>
      </p>
    </aside>
  );
}
