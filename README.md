# Plain Loan Math

Static site. Next.js App Router with `output: "export"`, TypeScript, Tailwind CSS.
Built and deployed by Cloudflare Pages. See `plain-loan-math-technical-brief-v1.md`.

## Working loop

1. Claude sends changed file(s) only.
2. Drop them into this folder, replacing the old ones.
3. Open GitHub Desktop → write a short summary → **Commit to main** → **Push origin**.
4. Cloudflare Pages builds and deploys automatically (1–3 minutes).

No terminal. No `npm install` on your machine. If a step ever seems to need one,
stop and ask — the approach is wrong.

## Cloudflare Workers build settings

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Node version | pinned by the `.node-version` file in this repo |

There is no "output directory" box to fill in. `wrangler.jsonc` in this repo
tells Cloudflare the finished site is in `out`.

This is Workers with static assets, not Pages. No Worker script runs — the
site is served as plain files from Cloudflare's edge.

## If a build fails

Nothing deploys and the live site is unaffected. Open the failed deployment in
Cloudflare, copy the whole build log, and paste it to Claude. Do not edit files
at random to try to fix it.

## Files you should not edit by hand

`package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`,
`postcss.config.mjs`, `wrangler.jsonc`, `.node-version`. Ask for a replacement
file instead.

## Not here yet, deliberately

- `public/ads.txt` — added when the AdSense publisher ID exists (§14)
- `app/sitemap.ts` — added when real pages exist (§22: no sitemap before then)
- Legal pages — written before any calculator ships (§23.5)
