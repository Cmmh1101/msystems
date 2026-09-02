# Montaño Systems — marketing site

Next.js MVP for Montaño Systems, the new public brand of **In Motion Web Solutions, LLC** (Tennessee). See [`docs/build-guide.md`](docs/build-guide.md) for the full launch plan, account setup, DNS cutover, and Phase 2 roadmap. The original design reference is at [`docs/design-mockup.html`](docs/design-mockup.html).

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

3. Create the Supabase table (run once in the Supabase SQL editor — see `docs/build-guide.md` section 2 for the exact SQL).

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

## Notes

- Content is hardcoded for this MVP — no CMS, no auth, no Moxie/FluentCRM integration (see `docs/build-guide.md` for what's explicitly out of scope today).
- The footer carries the required DBA legal disclosure: "Montaño Systems is a dba (assumed name) of In Motion Web Solutions, LLC, registered in Tennessee." Keep this accurate — update it if the DBA filing status changes.
