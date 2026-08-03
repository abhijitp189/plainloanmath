import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-20">
      <h1 className="text-2xl font-semibold text-ink">Page not found</h1>
      <p className="mt-3 text-muted">
        That page does not exist, or it has moved.
      </p>
      <Link href="/" className="mt-6 text-accent underline underline-offset-4">
        Back to the homepage
      </Link>
    </main>
  );
}
