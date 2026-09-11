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

3. Run the Supabase migrations in order, once each, in the Supabase SQL editor: [`0001_create_contacts.sql`](supabase/migrations/0001_create_contacts.sql), [`0002_diagnostic_and_subscription.sql`](supabase/migrations/0002_diagnostic_and_subscription.sql), [`0003_admin_contacts_notes.sql`](supabase/migrations/0003_admin_contacts_notes.sql), [`0004_create_posts.sql`](supabase/migrations/0004_create_posts.sql), [`0005_post_featured_image.sql`](supabase/migrations/0005_post_featured_image.sql), [`0006_post_translations.sql`](supabase/migrations/0006_post_translations.sql), [`0007_contacts_locale_and_nudge.sql`](supabase/migrations/0007_contacts_locale_and_nudge.sql), [`0008_clients_and_projects.sql`](supabase/migrations/0008_clients_and_projects.sql), [`0009_tickets.sql`](supabase/migrations/0009_tickets.sql), [`0010_client_portal_rls.sql`](supabase/migrations/0010_client_portal_rls.sql), then [`0011_case_studies.sql`](supabase/migrations/0011_case_studies.sql).

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
| `RESEND_API_KEY` | Resend API key — must be **Full access** permission, not "Sending access". A restricted sending-only key can send emails but 401s on any Audiences/Contacts call |
| `RESEND_AUDIENCE_ID` | The Resend Audience new leads get added to (see "Newsletter & nurture sequence" below) |
| `NOTIFY_EMAIL` | Where new-lead notifications are sent |
| `FROM_EMAIL` | Sending address — must match your verified Resend domain |
| `SUPABASE_ANON_KEY` | Supabase anon/publishable key, used for the `/admin` login session (safe to expose to the browser — different from the service_role key) |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same values as `SUPABASE_URL`/`SUPABASE_ANON_KEY`, duplicated under `NEXT_PUBLIC_` so the browser-side client in `/portal/auth/callback` can read them — Next.js only exposes `NEXT_PUBLIC_`-prefixed vars to client bundles |
| `ADMIN_EMAIL` | The only email allowed to log into `/admin` |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4 Measurement ID (`G-XXXXXXXXXX`). Tracking snippet only loads when `NODE_ENV=production`, so local dev traffic never hits real GA4 data |
| `GA4_PROPERTY_ID` | Numeric GA4 Property ID (different from the Measurement ID) — used by `/admin/analytics` to query the GA4 Data API |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service account email with Viewer access on the GA4 property |
| `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | Service account private key (from its JSON key file) — server-only, never exposed to the client |
| `STRIPE_SECRET_KEY` | Stripe secret (or restricted) key — account-wide, safe to reuse across other sites/products on the same Stripe account. Only needs Checkout Session write access; no publishable key is needed since checkout is server-created, not embedded Stripe.js |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for the `/api/webhooks/stripe` endpoint specifically — **not** reusable from another site's webhook endpoint on the same Stripe account, since Stripe issues one per registered endpoint URL. Created in Stripe Dashboard → Developers → Webhooks → Add endpoint, listening for `checkout.session.completed`, only after this endpoint is deployed and reachable |

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

### Newsletter & nurture sequence (Phase B)

No n8n, no separate automation platform — deliberately kept inside this same codebase (fewer tools, per what the business actually sells). Two pieces:

**Resend Audience sync.** Every new lead from `/api/contact` and `/api/diagnostic` (when opted in — the diagnostic quiz's checkbox, or the contact form's implicit `newsletter_opt_in` default) gets added to a Resend Audience via `lib/resendAudience.ts`. `/api/unsubscribe` marks them unsubscribed there too, keeping Resend's own suppression list in sync with `contacts.subscribed` — one source of truth for whether someone should hear from you again, checked in both places. Resend Audiences require a **Full access** API key; a restricted "Sending access" key 401s on any audience/contact call (this bit us during setup — the key that was already working fine for transactional email couldn't create the audience at all).

**Day-3 nudge**, via a Netlify Scheduled Function (`netlify/functions/nurture-nudge.mts`, cron `0 14 * * *` — runs daily at 14:00 UTC), not n8n: queries `contacts` for anyone still `status = 'new'`, `subscribed = true`, `created_at` at least 3 days old, and `nudge_sent_at IS NULL`; sends one low-pressure reminder email (in whichever `locale` they signed up in) linking back to booking; then sets `nudge_sent_at` so nobody gets nudged twice. No upper bound on the date window — if the function is ever delayed, it just catches up on the next run rather than silently skipping anyone. Migration 0007 adds the `locale` and `nudge_sent_at` columns this depends on.

Scheduled Functions read the same environment variables as the rest of the site (Netlify makes site-wide env vars available to all functions automatically — nothing extra to configure there). To test locally without waiting 3 real days: insert a contact with a backdated `created_at` directly via the Supabase REST API, then invoke the function's default export directly with `npx tsx` (it's a plain async function, no Netlify CLI required for a logic-only test).

## Client portal / PM (Phase D — in progress)

Full plan in [`docs/phase-d-client-portal-spec.md`](docs/phase-d-client-portal-spec.md). All 6 steps are built:

`clients` and `projects` tables (migration 0008), both service_role-only for now — RLS is enabled on both but has no policies yet; client-role policies get added once client portal auth exists (spec step 3). `/admin/clients` lists clients with a live project count per row (`projects(count)` embedded select, not a separate query per row); `/admin/clients/[id]` handles inline editing of name/email/company/status plus adding/managing that client's projects.

The primary path into this is `/admin/contacts` → **"Convert to client"** on any contact row, which pre-fills `/admin/clients/new` via query params and, on submit, both creates the client with `contact_id` pointing back to the original lead **and** flips that contact's `status` to `won` — so the CRM funnel stays accurate without a second manual step. A client can also be created from scratch with no originating contact (referrals, etc.) via the plain "New client" button.

`tickets` table (migration 0009) + an admin-only Kanban board at `/admin/projects/[id]` (linked from "View board" on each project row), drag-and-drop via `@dnd-kit/core`. Five columns matching the spec (Client Request, Needs Review, To Do, In Progress, Done); every ticket is currently `created_by_role: 'admin'` since client-facing creation doesn't exist yet (spec step 4). Dragging a card between columns optimistically updates the UI and PATCHes `column_status`, reverting on failure. Each card has an inline "Milestone" checkbox — toggling it on/off sets/clears `published_at`, which will drive the client portal's curated achievements feed once that's built. Tickets add directly into any column via a small inline input at the bottom of each — nothing gated by `billing_status` yet, since that logic only matters once clients can submit their own requests (spec step 5, the Stripe gate).

**Client auth + portal login** (migration 0010) — passwordless, magic-link only, no passwords to manage. From a client's detail page, "Send portal invite" (`/api/admin/clients/[id]/invite`) creates a Supabase Auth user for that client if one doesn't exist yet, links it via `clients.auth_user_id`, generates a magic link (`supabase.auth.admin.generateLink`), and emails it via Resend in the client's `locale`. Returning clients can request a fresh link themselves at `/portal/login` — `/api/portal/login` always returns the same generic response whether or not the email matches an invited client, so the portal never leaks who has access. The magic link lands on `/portal/auth/callback` — a **client-rendered** page, not a server route. `supabase.auth.admin.generateLink()` always redirects with the session as `#access_token=...&refresh_token=...` in the URL **hash fragment** (never as query params, and never sent to the server — fragments are browser-only), so the callback has to run client-side: it reads `window.location.hash`, then calls a browser-side `supabase.auth.setSession()` (via `lib/supabaseBrowser.ts`, which needs `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` — safe to duplicate from the server-only `SUPABASE_URL`/`SUPABASE_ANON_KEY`, since the anon key is designed to be public) before redirecting to `/portal`. `@supabase/ssr`'s browser client writes the same cookies the server-side `getSupabaseServer()` reads, so the session persists normally after that. Because Supabase falls back to the project's bare Site URL whenever the exact redirect path isn't on the Redirect URLs allowlist (an easy dashboard step to miss or mis-save), `components/AuthHashRedirect.tsx` is mounted in the root layout on every page — it watches for a stray `#access_token=` fragment landing anywhere on the site and forwards it to `/portal/auth/callback`, so a misconfigured allowlist doesn't strand a client on the homepage with a dead link.

**Google sign-in** is a second login method alongside magic links — `PortalLoginForm`'s "Continue with Google" button calls the browser client's `signInWithOAuth({ provider: "google" })`, which uses Supabase's PKCE flow and lands back on `/portal/auth/callback` with `?code=...` in the query string instead of a hash fragment; the callback page handles both shapes (hash tokens via `setSession()`, or a code via `exchangeCodeForSession()`). Needs a Google Cloud OAuth Client ID/Secret entered into Supabase's Google provider settings (Authentication → Providers), with the OAuth app's authorized redirect URI set to Supabase's own fixed callback (`https://<project-ref>.supabase.co/auth/v1/callback`, **not** this app's `/portal/auth/callback`) — the same Redirect URLs allowlist entry already needed for magic links covers this flow too, no separate entry required.

Since Google sign-in creates its own Supabase Auth identity with no inherent link to an admin-invited `clients` row, authorization for **every** login method now runs through one shared gate: `/api/portal/claim`, called by the callback page right after a session is established. It looks up `clients` by the signed-in email — found means access, linking `auth_user_id` to whichever identity just signed in (so a client can freely switch between magic link and Google across logins); not found means an immediate `supabase.auth.signOut()` and a denial, no self-signup possible. This also means Google sign-in works for any client the admin has added, even ones who were never sent a magic-link invite — the invite button remains the only way to trigger the *welcome email*, but it's no longer the only way to gain access. A "Client Portal" link (`/portal/login`) is in the header, mobile menu, and footer of the public site — hidden from the header's always-visible row below the 860px breakpoint (mirroring how the language toggle is handled) since that row has no room to spare on mobile, but still reachable from the mobile menu. `middleware.ts` now branches on path: `/admin/*` keeps its existing `ADMIN_EMAIL` check untouched, `/portal/*` requires a session linked to a real `clients` row (via `lib/clientAuth.ts`'s `requireClient()`), except `/portal/auth/callback` itself, which has no session yet when it runs. Its Supabase cookie adapter uses the batched `getAll`/`setAll` form, not the older per-cookie `get`/`set`/`remove` trio — the per-cookie form reassigns the response object on every individual write, so any call touching more than one cookie (a chunked auth-token cookie, or a client-side PKCE verifier cookie already sitting on the request) silently loses every write but the last; this was live from Step 3 onward and is the likely cause of an "PKCE code verifier not found in storage" failure on Google sign-in specifically, since that flow's callback request is exactly the kind that could carry a verifier cookie into a middleware pass that then clobbers it. The dashboard at `/portal` (styled with the public site's brand tokens, not the admin dark theme) shows the client's name/company and their projects; tickets and the milestone feed are deliberately deferred to step 4. Client-role RLS policies from migration 0010 are defense-in-depth only — the portal pages always go through service_role + explicit ownership filters in code, same pattern as `/admin/*`.

**Client-facing ticket creation + milestone feed** — a client's project page (`/portal/projects/[id]`) has a "New request" form that POSTs to `/api/portal/tickets`; every client-created ticket is forced server-side into `column_status: 'client_request'`, `billing_status: 'n/a'`, `created_by_role: 'client'` regardless of what the client sends, matching the spec's insert policy exactly — the route also independently verifies the target project belongs to the calling client before allowing the insert (defense-in-depth on top of migration 0010's RLS). The same page lists that client's own tickets plus any ticket flagged `is_milestone` on that project, even ones created by admin — mirroring the "see your own tickets in full, plus curated milestones from everything else" RLS condition, enforced again in code via an explicit `.or()` filter rather than relying on RLS alone. The main `/portal` dashboard additionally surfaces a cross-project "Recent milestones" feed, most recent `published_at` first. Nothing here lets a client change `column_status`, `billing_status`, or flag their own milestones — those stay admin-only via the existing Kanban board.

**Public case studies** (migration 0011) — `case_studies` table (title/summary/details, optional bilingual `_es` fields following the blog's fallback-to-English pattern, nullable `client_id`/`project_id` to allow anonymized studies, `published`/`published_at`). Admin authoring at `/admin/case-studies` reuses the blog's exact editor shape (Markdown write/preview tabs, EN/ES language tabs, slug auto-derived from the English title) plus a client/project picker scoped by the selected client. The public `/results` page lists published case studies as cards linking to `/results/[slug]`, which renders the full Markdown write-up — same `force-no-store` caching fix as `/blog` so publish/unpublish never shows stale. A `ResultsTeaser` server component surfaces the 3 most recent published case studies between the homepage's About and CTA sections, and returns nothing at all if there are zero published yet (no empty section pre-launch). "Results" was added to the header/footer nav and dictionary in both languages.

**Stripe billing gate** (step 5) — on the admin Kanban board, any ticket that isn't already quoted or paid gets a "Quote a fee…" control on its card; entering an amount and optional description calls `/api/admin/tickets/[id]/quote`, which creates a Stripe Checkout Session with an ad-hoc `price_data` line item (no pre-created Stripe Products/Prices needed — each quote is a one-off amount, matching the spec's per-ticket fee model), stores the session URL on `tickets.stripe_payment_link`, and sets `billing_status: 'quoted'`. The client portal shows a "Pay now" button linking straight to that Checkout URL. `/api/webhooks/stripe` verifies the `stripe-signature` header against `STRIPE_WEBHOOK_SECRET` (rejecting anything that doesn't match) and, on `checkout.session.completed`, reads the ticket id back out of the session's `metadata` and flips `billing_status: 'paid'` + `column_status: 'to_do'` automatically — no manual step once the client pays. The Stripe secret key is shared with other sites on the same Stripe account (safe — it's account-wide, not site-specific), but the webhook signing secret is unique to this endpoint's URL and can't be reused from elsewhere.

All 6 steps of Phase D are now complete.

## English / Spanish (i18n)

The public site (homepage, diagnostic quiz, blog UI, all transactional emails) has a manual EN/ES toggle in the header — no translation API, no ongoing cost. Two layers:

- **Static UI text** — every fixed string (nav, buttons, headings, form labels, quiz questions/tiers) lives in `lib/i18n/dictionary.ts` as parallel `en`/`es` objects, translated once and hardcoded. `lib/i18n/server.ts` reads the `lang` cookie (`getLocale()`) for Server Components; Client Components (`Header`, `ContactForm`, `DiagnosticQuiz`) receive `locale` as a prop from their Server Component parent instead of reading the cookie themselves. `components/LanguageToggle.tsx` sets the cookie and calls `router.refresh()` to re-render Server Components with the new locale — Client Component state (e.g. the diagnostic quiz's current step) is preserved since only the page shell re-renders, not the whole app.
- **Blog post content** — manual dual-language entry, not machine translation. Migration 0006 adds `title_es`/`excerpt_es`/`content_es` to `posts`. The editor has an English/Español tab (slug, published state, and featured image stay shared — only title/excerpt/content differ per language). `lib/posts.ts`'s `localizedPost()` picks the Spanish fields when `locale === "es"` **and** `title_es` is set, otherwise falls back to English — so publishing a post with no Spanish content is always safe, nothing breaks or shows blank.

Root layout's `<html lang>` updates to match the cookie. Contact form and diagnostic quiz emails are sent in whichever language the visitor was using when they submitted (a `locale` field travels with the POST body); the internal "new lead" notification to `NOTIFY_EMAIL` always stays in English since that's for Carla, not the visitor.

## Notes

- Content is hardcoded for this MVP — no CMS, no Moxie/FluentCRM integration (see `docs/build-guide.md` for what's explicitly out of scope today).
- The footer carries the required DBA legal disclosure: "Montano Systems is a dba (assumed name) of In Motion Web Solutions, LLC, registered in Tennessee." Keep this accurate — update it if the DBA filing status changes, and make sure the TN Form SS-4402 filing uses this same spelling ("Montano", no ñ).
