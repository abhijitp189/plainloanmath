import type { Metadata } from "next";
import "./globals.css";
import ReactDOM from "react-dom";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const GA_MEASUREMENT_ID = "G-4EFBNNEMNP";

export const metadata: Metadata = {
  metadataBase: new URL("https://plainloanmath.com"),
  title: {
    default: "Plain Loan Math",
    template: "%s | Plain Loan Math",
  },
  description:
    "Free mortgage calculators and plain explanations of the math. No lender pays us, and there are no rate quotes or lead forms.",
  alternates: { canonical: "/" },
};

// Archivo, self-hosted from /public/fonts. Preloaded because the @font-face
// rules sit inside the stylesheet, so the browser would otherwise only
// discover the files after the CSS has parsed — late enough to show a visible
// swap on a slow connection.
//
// ReactDOM.preload rather than a raw <link>. React hoists rel="preload" links
// into the head on its own AND leaves the original where it was written, so a
// hand-written tag renders twice no matter where it is placed — verified in
// the built HTML both ways. This emits exactly one.
//
// crossOrigin is required on font preloads even same-origin. Without it the
// preloaded file is not matched to the font request and gets fetched twice.
const FONT_PRELOAD = {
  as: "font",
  type: "font/woff2",
  crossOrigin: "anonymous",
} as const;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  ReactDOM.preload("/fonts/archivo-latin-400-normal.woff2", FONT_PRELOAD);
  ReactDOM.preload("/fonts/archivo-latin-700-normal.woff2", FONT_PRELOAD);

  return (
    <html lang="en">
      <head>
        {/* GA4 — brief v2 §16. Plain tags so they are visible in view-source.
            When the CMP lands (month 3), these get gated behind consent. */}
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}');`,
          }}
        />
      </head>
      <body className="flex min-h-screen flex-col bg-surface font-sans text-ink antialiased">

        {/* Print header — design guide §9. Hidden on screen. The browser's own
            print chrome supplies the page title, the URL and today's date, so
            none of those are rendered here: a date baked in at build time is
            wrong the day after it ships, which is the bug the footer copyright
            year already has. */}
        <div className="print-only border-b-rule border-line-strong pb-3 text-[0.8rem]">
          <p className="font-bold">Plain Loan Math &mdash; plainloanmath.com</p>
          <p>
            Estimates only. Not financial advice, and not a loan offer.
          </p>
        </div>

        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
