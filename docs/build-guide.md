# Montaño Systems — Launch-Day Build Guide

## 0. Realistic scope for today

**Ship today:**
- New Next.js site (design from the mockup), deployed on Netlify
- Lead capture form → Supabase (replaces Fluent Forms + starts replacing FluentCRM's contact intake)
- Resend sends: (1) internal "new lead" notification to you, (2) auto-reply to the lead
- Site live on a Netlify subdomain or preview URL first, DNS cutover to your real domain only after you've verified it end-to-end

**Do NOT touch today:**
- **Moxie** — keep it exactly as-is for existing client invoicing, contracts, and payments. This is the one system where a mistake costs real money. It gets a proper replacement plan in Phase 2, not a same-day swap.
- Your live FluentCRM automations — leave them running until the new system is proven, then retire them deliberately (export contact data first, don't just delete).

**Phase 2 (this week/next):**
- n8n workflow connecting new Supabase leads → tagging/routing → into a lightweight pipeline view (Airtable) — this becomes your FluentCRM replacement.
- Decide Moxie's replacement (likely Stripe invoicing + Supabase contracts) only once the lead-gen system has run cleanly for a bit.

---

## 0a. Brand / entity / domain relationship

- **Legal entity:** In Motion Web Solutions, LLC (Tennessee) — unchanged.
- **Public brand:** Montaño Systems — used across the site, marketing, contracts, and invoices.
- **DBA filing:** file Form SS-4402 (Application for Registration of Assumed Name)
  with the Tennessee Secretary of State — $20 fee, can be done online, active
  for 5 years. File this now, independent of the site rebuild — it's what
  makes the footer disclosure below accurate. Check name availability first
  at the TN Secretary of State's business name search before filing.
- **Domain:** stays `inmotionwebsolutions.com` for now — no new domain purchase
  needed. The DNS cutover in Section 6 still applies when moving off
  WordPress/SiteGround, just pointed at the existing domain.
- **Footer/legal disclosure required on every page:** "Montaño Systems is a
  dba (assumed name) of In Motion Web Solutions, LLC, registered in Tennessee."

---

## 1. Accounts/setup checklist (do these first, ~15 min)

- [ ] Supabase project created (supabase.com) — note **Project URL**, **anon key**, **service_role key**
- [ ] Resend account (resend.com) — add and verify your sending domain (SPF/DKIM records), note **API key**
- [ ] Netlify account connected to your GitHub — repo created for the project
- [ ] Keep SiteGround/WordPress live and untouched until cutover

---

## 2. Supabase schema

Run this in the Supabase SQL editor:

```sql
create extension if not exists "pgcrypto";

create table contacts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text not null,
  email text not null,
  phone text,
  company text,
  message text,
  source text default 'website',
  status text default 'new',
  tags text[] default '{}'
);

-- Lock the table down completely — all access goes through
-- server-side API routes using the service_role key, never the client.
alter table contacts enable row level security;
-- (no policies created = no public access at all, by design)
```

---

## 3. Environment variables

```
NEXT_PUBLIC_SITE_URL=https://inmotionwebsolutions.com
SUPABASE_URL=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx      # server-only, never exposed to client
RESEND_API_KEY=xxx
NOTIFY_EMAIL=carla@inmotionwebsolutions.com   # where new-lead alerts go
FROM_EMAIL=hello@inmotionwebsolutions.com     # must match your verified Resend domain
```

**Note:** the domain stays `inmotionwebsolutions.com` for now — the site is
rebranding visually to Montaño Systems while the domain and legal entity
(In Motion Web Solutions, LLC) stay the same. Montaño Systems will be filed
as a DBA (assumed name) of the LLC — see Section 0a.

Set these in Netlify's dashboard (Site settings → Environment variables), and in a local `.env.local` (gitignored) for development.

---

## 4. Agent build prompt

Paste everything in the box below to your coding agent (Claude Code or similar) as the project brief. Attach the `montano-systems-mvp.html` mockup file alongside it as the visual reference.

```
PROJECT: Montaño Systems marketing site — Next.js MVP

GOAL
Build and deploy a production-ready marketing site for Montaño Systems, a
business-systems/automation/AI consultancy. Reference the attached HTML
mockup (montano-systems-mvp.html) as the exact visual and content reference
— port its design faithfully into a real Next.js app, don't reinterpret it.

STACK
- Next.js 14+ (App Router, TypeScript)
- Tailwind CSS — translate the mockup's CSS variables into Tailwind theme
  tokens (colors: ink #0F1B2D, ink-2 #172A42, paper #F5F3EE, paper-2 #ECE8DE,
  graphite #1C2530, line #7FB8D9, brass #B8935A, brass-light #D4B483).
  Fonts: Space Grotesk (display), IBM Plex Sans (body), IBM Plex Mono (labels/mono),
  loaded via next/font/google.
- Supabase (@supabase/supabase-js) — server-side only, using the service_role
  key inside API routes. Never expose service_role to the client.
- Resend (resend package) for transactional email.
- Deploy target: Netlify, using @netlify/plugin-nextjs.

PAGES / SECTIONS (single homepage for MVP, componentized)
1. Sticky header/nav: wordmark "MONTAÑO SYSTEMS", nav links (Services,
   About, Contact), primary CTA button "Book an audit".
2. Hero: eyebrow label, headline "Your business runs on twelve tools that
   don't talk to each other.", subhead, two CTAs ("Book a systems audit",
   "See how it works"), the schematic SVG diagram (6 scattered tool boxes
   converging into one "SYSTEM" node — recreate the SVG from the mockup as
   a React component), and the 01–05 step bar (Audit / Build / Develop /
   Automate / Partner) underneath.
3. Problem section: short statement on tool sprawl (light background).
4. Modules/services section: 5-column grid (collapses to 3, then 2, then 1
   on mobile) — Audit & Roadmap, Systems Build, Custom Development, AI &
   Intelligence, Ongoing Partner — each with a number, title, description,
   and a "spec" line (timeline/pricing model). Custom Development is
   distinct from Systems Build: Systems Build connects existing tools
   (no/low-code, faster, cheaper); Custom Development is for building
   something that doesn't exist yet — a portal, internal tool, or web app
   — using real code, and is priced/scoped as a longer, higher-ticket
   engagement.
5. About section: portrait placeholder, bio copy about Carla Montaño,
   link out to https://carlamontano.io, and a "right-sized collaborator
   team" note.
6. CTA section: closing headline + button, same dark/grid background
   treatment as the hero.
7. Footer: wordmark, nav links, link to carlamontano.io, copyright line
   reading "© 2026 In Motion Web Solutions, LLC — dba Montaño Systems",
   and below it a separate legal disclosure line: "Montaño Systems is a
   dba (assumed name) of In Motion Web Solutions, LLC, registered in
   Tennessee." This disclosure is required on every page — the LLC name
   and DBA relationship must be accurate and visible, not just the brand
   name.

IMPORTANT — domain: this site deploys to the existing domain
inmotionwebsolutions.com, not a new domain. Do not hardcode or reference
any other domain name anywhere in the code (metadata, canonical URLs,
email addresses, etc.) — use inmotionwebsolutions.com throughout, sourced
from the NEXT_PUBLIC_SITE_URL environment variable, not hardcoded.

FUNCTIONAL REQUIREMENTS

A) Contact/lead form
   - Fields: name (required), email (required), company (optional),
     message (required).
   - Client-side validation (required fields, valid email format).
   - On submit, POST to /api/contact.
   - Show a clear success state in the interface's voice (e.g. "Got it —
     we'll be in touch within one business day.") and a clear error state
     if the request fails, with a way to retry.
   - This form should appear in the CTA section (inline or as a modal —
     your choice, favor simplicity for launch speed).

B) /api/contact route (Next.js Route Handler)
   - Validate incoming payload server-side (don't trust the client).
   - Insert a row into Supabase `contacts` table using the service_role
     client: { name, email, phone (if collected), company, message,
     source: 'website', status: 'new' }.
   - Send two emails via Resend:
     1. Internal notification to NOTIFY_EMAIL: "New lead: {name}" with
        all submitted fields.
     2. Auto-reply to the submitter's email, from FROM_EMAIL, short and
        human: confirms receipt, sets expectation of a response time,
        signed from Carla.
   - Return a clean JSON success/error response; handle Supabase or
     Resend failures gracefully (log server-side, still return a sensible
     response to the client — don't leak internals in the error message).

C) Environment & config
   - Read all secrets from environment variables (see .env.example below).
   - Include a netlify.toml with the Next.js plugin configured.
   - Include a .env.example listing all required variables (no real values).

D) Accessibility & quality bar
   - Responsive down to 375px width.
   - Visible keyboard focus states on all interactive elements.
   - Respect prefers-reduced-motion (mockup already handles this — keep it).
   - Semantic HTML (proper heading hierarchy, form labels, button vs link
     usage matching actual behavior).

DELIVERABLES
- Full working Next.js app, buildable with `npm run build`.
- SQL schema already created in Supabase (see accompanying guide) — just
  wire up the client, don't recreate the schema in code.
- netlify.toml + .env.example
- A short README with: setup steps, env vars needed, and how to deploy
  (git push → Netlify auto-deploy, or `netlify deploy --prod`).

NOT IN SCOPE for this build (explicitly exclude)
- No CMS/admin panel — content is hardcoded in components for the MVP.
- No user authentication.
- No integration with Moxie or FluentCRM — those stay on their current
  systems for now, do not attempt to connect or migrate them.
- No blog/content pages beyond the single homepage.
```

---

## 5. Deployment steps

1. Push the repo to GitHub.
2. In Netlify: "Add new site" → import from Git → select the repo.
3. Netlify should auto-detect Next.js; confirm the `@netlify/plugin-nextjs` is applied (it usually installs automatically).
4. Add all environment variables from Section 3 in Netlify's dashboard.
5. Deploy → test on the generated `*.netlify.app` URL first:
   - Submit the contact form yourself, confirm the row lands in Supabase and both emails arrive.
   - Check mobile responsiveness and all links.
6. Only after that passes, move to DNS cutover.

---

## 6. DNS cutover (do this carefully, last)

- [ ] Confirm your **email (MX records)** are separate from web hosting — don't let a DNS change break carla@ email delivery. If SiteGround currently handles mail too, document the exact MX/TXT records before changing anything.
- [ ] In Netlify, add your custom domain and follow its DNS instructions (usually pointing A/CNAME records to Netlify).
- [ ] Update SPF/DKIM records for Resend sending domain if not already verified.
- [ ] Keep SiteGround active and unchanged until DNS has fully propagated (can take a few hours) and you've re-verified the live domain works.
- [ ] Set up 301 redirects for any old WordPress URLs you want preserved for SEO — only after traffic is confirmed flowing to the new site.
- [ ] Cancel/downgrade SiteGround only after everything above is confirmed stable for a few days — not same-day.

---

## 7. Phase 2 — CRM & Moxie roadmap (not today)

| System today | Replaces with | When |
|---|---|---|
| Fluent Forms | Supabase `contacts` table via /api/contact | ✅ Today |
| FluentCRM (basic capture) | Supabase `contacts` table | ✅ Today |
| FluentCRM (automations/tagging) | n8n workflow triggered on new Supabase rows | Next 1-2 weeks |
| FluentCRM (pipeline view) | Airtable synced from Supabase via n8n | Next 1-2 weeks |
| Moxie (invoicing/contracts/payments) | Evaluate Stripe + Supabase, or keep Moxie longer-term | After the above is stable — no rush |
