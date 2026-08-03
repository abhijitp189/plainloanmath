export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-20">
      <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        Plain Loan Math
      </h1>

      <p className="mt-3 text-lg text-muted">Mortgage math, explained plainly.</p>

      <div className="mt-10 border-t border-line pt-8">
        <p className="text-base leading-relaxed text-ink-2">
          This site is being built. It will hold free mortgage calculators and
          plain explanations of how the math actually works — what an extra
          payment really saves, how amortization front-loads interest, and when
          refinancing pays for itself.
        </p>

        <p className="mt-4 text-base leading-relaxed text-ink-2">
          No lender pays us. There are no rate quotes, no lead forms, and
          nothing here is financial advice.
        </p>
      </div>

      <p className="mt-10 text-sm text-muted">
        First calculators expected in the coming months.
      </p>
    </main>
  );
}
