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

3. Run the Supabase migrations in order, once each, in the Supabase SQL editor: [`0001_create_contacts.sql`](supabase/migrations/0001_create_contacts.sql), [`0002_diagnostic_and_subscription.sql`](supabase/migrations/0002_diagnostic_and_subscription.sql), [`0003_admin_contacts_notes.sql`](supabase/migrations/0003_admin_contacts_notes.sql), [`0004_create_posts.sql`](supabase/migrations/0004_create_posts.sql), [`0005_post_featured_image.sql`](supabase/migrations/0005_post_featured_image.sql), then [`0006_post_translations.sql`](supabase/migrations/0006_post_translations.sql).

3a. The blog editor's image upload needs a public Storage bucket named `blog-images` (5MB limit, PNG/JPEG/WebP/GIF only). It already exists on the project this app is configured for — if you ever point this app at a fresh Supabase project, create it first: Supabase Dashboard → Storage → New bucket → name `blog-images`, **Public bucket** on.

4. Create the admin user: Supabase Dashboard → **Authentication → Users → Add User**, using the exact email you set as `ADMIN_EMAIL` and a password of your choosing. There's no public signup page — this is the only way an admin account gets created, and only this one email can log into `/admin`.

5. Run the dev server:

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
| `SUPABASE_ANON_KEY` | Supabase anon/publishable key, used for the `/admin` login session (safe to expose to the browser — different from the service_role key) |
| `ADMIN_EMAIL` | The only email allowed to log into `/admin` |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4 Measurement ID (`G-XXXXXXXXXX`). Tracking snippet only loads when `NODE_ENV=production`, so local dev traffic never hits real GA4 data |
| `GA4_PROPERTY_ID` | Numeric GA4 Property ID (different from the Measurement ID) — used by `/admin/analytics` to query the GA4 Data API |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service account email with Viewer access on the GA4 property |
| `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | Service account private key (from its JSON key file) — server-only, never exposed to the client |

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

## Admin panel

`/admin` (Contacts CRM, blog CMS, and GA4 dashboard all live — Phase C complete, see [`docs/build-guide.md`](docs/build-guide.md)). Single-admin auth: Supabase Auth session via `@supabase/ssr`, gated by `middleware.ts` plus a server-side re-check in `app/admin/(dashboard)/layout.tsx` and in every `/api/admin/*` route handler (never trust the middleware redirect alone for actual writes). Only the exact `ADMIN_EMAIL` can access it — there's no signup flow, so the first (and only) admin user must be created manually in the Supabase Dashboard.

`/admin/contacts` lists every row from `contacts` (both the contact form and diagnostic quiz feed into this same table) with inline status and notes editing, searchable and filterable by status/source. Writes go through `/api/admin/contacts/[id]` using the service_role client — the admin UI never talks to Supabase directly from the browser.

**Caching note:** every page reading `contacts` or `posts` sets both `export const dynamic = "force-dynamic"` *and* `export const fetchCache = "force-no-store"`. The `dynamic` flag alone wasn't enough in testing — the Supabase JS client's underlying `fetch` calls got cached by Next.js's fetch-cache anyway (reproducible even across dev server restarts, since that cache persists in `.next/cache`), serving stale data after a publish/unpublish. `fetchCache = "force-no-store"` is the explicit override that actually fixed it. If you add a new page that reads live data from Supabase, set both.

`/admin/blog` is a Markdown CMS (`posts` table, migration 0004) — list, create, edit, delete, with a Write/Preview toggle rendered via `react-markdown`. Slugs auto-generate from the title (editable) and must be unique. Draft posts (`published: false`) never appear on the public site; `/blog` and `/blog/[slug]` only ever query `published = true`. Publishing sets `published_at` once and leaves it alone on later edits, so post dates don't shift every time you fix a typo.

Posts can carry a featured image (migration 0005: `featured_image_url`, `featured_image_alt`). Uploads go through `/api/admin/upload` to the `blog-images` Storage bucket (server-side, service_role — never a direct client-to-Storage upload), with type/size validation (5MB max, PNG/JPEG/WebP/GIF only) enforced both in the API route and at the bucket level. Replacing or removing an image, or deleting a post that has one, cleans up the old file from Storage so nothing orphans. The image shows as a thumbnail on `/blog`, a hero image on the post page, and populates `og:image` for social sharing.

### GA4 analytics dashboard

`/admin/analytics` (`lib/ga4.ts`) queries the GA4 Data API server-side via `@google-analytics/data`, authenticated as a service account — never the browser. Shows the last 30 days: active users / sessions / page views, a daily sessions bar chart, top pages, and top traffic sources (channel grouping). If the API call fails (e.g. access hasn't propagated yet, or env vars are missing), the page shows a friendly message instead of crashing.

One-time setup, since this touches two separate Google systems:

1. **Create the GA4 property**: analytics.google.com → Admin → Create Account/Property → Web platform → grab the **Measurement ID** (`G-XXXXXXXXXX`) from the resulting Data Stream → set as `NEXT_PUBLIC_GA_MEASUREMENT_ID`.
2. **Create a Google Cloud service account**: console.cloud.google.com → create/select a project → enable the **Google Analytics Data API** → IAM & Admin → Service Accounts → create one → its **Keys** tab → Add Key → **Create new key (JSON)**.
   - If key creation is blocked with `iam.disableServiceAccountKeyCreation` (Google's "Secure by Default" org policy, common on Workspace-linked Cloud accounts): IAM & Admin → Organization Policies → search `KeyCreation` → override that constraint to Off for the project. If it's still blocked afterward, also check **`iam.disableServiceAccountKeyUpload`** — despite the name, both can independently block the same "Create new key" action and need to be off.
3. **Grant that service account read access to GA4**: from the downloaded JSON, copy `client_email` → GA4 → Admin → **Property Access Management** → Add users → paste the email → role **Viewer**.
4. **Get the Property ID**: GA4 → Admin → **Property Details** — a plain number, not the same as the Measurement ID from step 1.
5. Set env vars: `GA4_PROPERTY_ID` (step 4), `GOOGLE_SERVICE_ACCOUNT_EMAIL` (the `client_email` from the JSON), `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` (the `private_key` from the JSON, newlines and all — the code un-escapes `\n` at runtime, so paste it as the single-line JSON string gave it to you). Never commit the JSON key file itself; only these two extracted fields go into env vars.

## English / Spanish (i18n)

The public site (homepage, diagnostic quiz, blog UI, all transactional emails) has a manual EN/ES toggle in the header — no translation API, no ongoing cost. Two layers:

- **Static UI text** — every fixed string (nav, buttons, headings, form labels, quiz questions/tiers) lives in `lib/i18n/dictionary.ts` as parallel `en`/`es` objects, translated once and hardcoded. `lib/i18n/server.ts` reads the `lang` cookie (`getLocale()`) for Server Components; Client Components (`Header`, `ContactForm`, `DiagnosticQuiz`) receive `locale` as a prop from their Server Component parent instead of reading the cookie themselves. `components/LanguageToggle.tsx` sets the cookie and calls `router.refresh()` to re-render Server Components with the new locale — Client Component state (e.g. the diagnostic quiz's current step) is preserved since only the page shell re-renders, not the whole app.
- **Blog post content** — manual dual-language entry, not machine translation. Migration 0006 adds `title_es`/`excerpt_es`/`content_es` to `posts`. The editor has an English/Español tab (slug, published state, and featured image stay shared — only title/excerpt/content differ per language). `lib/posts.ts`'s `localizedPost()` picks the Spanish fields when `locale === "es"` **and** `title_es` is set, otherwise falls back to English — so publishing a post with no Spanish content is always safe, nothing breaks or shows blank.

Root layout's `<html lang>` updates to match the cookie. Contact form and diagnostic quiz emails are sent in whichever language the visitor was using when they submitted (a `locale` field travels with the POST body); the internal "new lead" notification to `NOTIFY_EMAIL` always stays in English since that's for Carla, not the visitor.

## Notes

- Content is hardcoded for this MVP — no CMS, no Moxie/FluentCRM integration (see `docs/build-guide.md` for what's explicitly out of scope today).
- The footer carries the required DBA legal disclosure: "Montano Systems is a dba (assumed name) of In Motion Web Solutions, LLC, registered in Tennessee." Keep this accurate — update it if the DBA filing status changes, and make sure the TN Form SS-4402 filing uses this same spelling ("Montano", no ñ).
