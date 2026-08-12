/**
 * The numeric input every calculator uses.
 *
 * Extracted August 12, 2026. Two versions of this existed — the payment
 * calculator's, which positioned the `$` and `%` absolutely as design guide
 * §4.3 specifies, and the payoff calculator's, which used a flex row with a
 * border on the wrapper instead. They looked almost the same and behaved
 * differently: the flex version put the border on a div rather than the input,
 * so `:focus` styling, `disabled` styling and the focus ring all had to be
 * reimplemented, and only two of the three were. This is the §4.3 version.
 *
 * Conventions this guarantees, so no future calculator has to remember them:
 *   - `min-height: 46px` and a real `<label for>` — design guide §7
 *   - `inputMode="decimal"` on every field, so phones open a number pad
 *   - prefix and suffix are `pointer-events: none`, so tapping the `$` still
 *     focuses the input rather than doing nothing
 *   - `type="text"`, not `type="number"`: a number input silently rejects
 *     pasted values containing commas, which is exactly how people paste a
 *     loan balance
 */
export default function CalcField({
  id,
  label,
  value,
  onChange,
  onBlur,
  prefix,
  suffix,
  hint,
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  prefix?: string;
  suffix?: string;
  hint?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[0.83rem] font-semibold text-ink-2"
      >
        {label}
      </label>
      <div className="relative mt-1.5">
        {prefix && (
          <span
            aria-hidden="true"
            className="num pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[0.95rem] text-muted"
          >
            {prefix}
          </span>
        )}
        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className={`num min-h-[46px] w-full border border-line-strong bg-surface py-2 text-[0.98rem] text-ink transition-colors duration-150 focus:border-accent focus:outline-none disabled:bg-paper disabled:text-muted ${
            prefix ? "pl-7" : "pl-3"
          } ${suffix ? "pr-12" : "pr-3"}`}
        />
        {suffix && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[0.85rem] text-muted"
          >
            {suffix}
          </span>
        )}
      </div>
      {hint && <p className="mt-1 text-[0.78rem] text-muted">{hint}</p>}
    </div>
  );
}

/**
 * The select every calculator uses, styled to match CalcField exactly.
 *
 * A native `<select>` rather than a custom listbox: it is keyboard-navigable
 * and screen-reader-announced with no ARIA at all, and on a phone it opens the
 * platform picker, which is better than anything worth hand-building here.
 */
export function CalcSelect({
  id,
  label,
  value,
  onChange,
  options,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  hint?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[0.83rem] font-semibold text-ink-2"
      >
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 min-h-[46px] w-full border border-line-strong bg-surface px-3 text-[0.98rem] text-ink transition-colors duration-150 focus:border-accent focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hint && <p className="mt-1 text-[0.78rem] text-muted">{hint}</p>}
    </div>
  );
}
