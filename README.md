# Montano Systems — marketing site

Next.js MVP for Montano Systems, the new public brand of **In Motion Web Solutions, LLC** (Tennessee). See [`docs/build-guide.md`](docs/build-guide.md) for the full launch plan, account setup, DNS cutover, and Phase 2 roadmap. The original design reference is at [`docs/design-mockup.html`](docs/design-mockup.html) — note the brand name there still uses "Montaño"; the live site uses the Anglicized "Montano" instead (no ñ), see below. The client portal / PM / Moxie-replacement plan (not yet built) is spec'd out in [`docs/phase-d-client-portal-spec.md`](docs/phase-d-client-portal-spec.md).

## Stack

- Next.js 14 (App Router, TypeScript)
- Tailwind CSS
- Supabase (`contacts` table, server-side only via service role key)
- Resend (transactional email)
- Deployed on Netlify

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the env file and fill in real values:

   ```bash
   cp .env.example .env.local
   ```

3. Run the Supabase migrations in order, once each, in the Supabase SQL editor: [`0001_create_contacts.sql`](supabase/migrations/0001_create_contacts.sql), then [`0002_diagnostic_and_subscription.sql`](supabase/migrations/0002_diagnostic_and_subscription.sql).

4. Run the dev server:

   ```bash
   npm run dev
   ```

## Environment variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Public site URL, `https://inmotionwebsolutions.com` — domain does not change with the rebrand |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only Supabase key, used in `/api/contact` — never expose to the client |
| `RESEND_API_KEY` | Resend API key |
| `NOTIFY_EMAIL` | Where new-lead notifications are sent |
| `FROM_EMAIL` | Sending address — must match your verified Resend domain |

## Deploy (Netlify)

1. Push this repo to GitHub.
2. In Netlify: **Add new site → Import from Git** → select the repo.
3. Netlify auto-detects Next.js and applies `@netlify/plugin-nextjs` (already configured in `netlify.toml`).
4. Add all environment variables above in **Site settings → Environment variables**.
5. Deploy, then test on the generated `*.netlify.app` URL first — submit the contact form, confirm the row lands in Supabase and both emails arrive.
6. Only after that passes, do the DNS cutover from SiteGround/WordPress — see `docs/build-guide.md` section 6.

Or deploy directly from the CLI:

```bash
netlify deploy --prod
```

## Free Systems Check (lead-gen quiz)

`/diagnostic` is a 6-question interactive quiz (`components/diagnostic/DiagnosticQuiz.tsx`, questions/scoring in `lib/diagnostic.ts`). Flow: answer questions → email gate → `/api/diagnostic` recomputes the score server-side (never trusts the client score), saves a `contacts` row (source `diagnostic`, tagged `diagnostic-lead`) plus a linked `diagnostic_results` row, emails the report via Resend, and returns the tier so the results screen can render. "Download report" uses the browser's native print-to-PDF (`window.print()` with a print stylesheet) rather than a server-side PDF library — simplest option for the MVP, easy to swap later if you want a branded PDF template.

`/api/unsubscribe?email=...` flips `contacts.subscribed` to `false`. Nothing currently checks that flag before sending — today's emails are all one-time transactional sends (contact confirmation, diagnostic report), not recurring — but it's there as the foundation for the Phase 2 newsletter/sequence work (n8n + Resend Audiences), so that flag can gate future bulk sends.

## Notes

- Content is hardcoded for this MVP — no CMS, no auth, no Moxie/FluentCRM integration (see `docs/build-guide.md` for what's explicitly out of scope today).
- The footer carries the required DBA legal disclosure: "Montano Systems is a dba (assumed name) of In Motion Web Solutions, LLC, registered in Tennessee." Keep this accurate — update it if the DBA filing status changes, and make sure the TN Form SS-4402 filing uses this same spelling ("Montano", no ñ).
