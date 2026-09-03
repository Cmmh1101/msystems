# Phase D — Client Portal, Project Management & Case Studies

Status: **planned, not started**. This is the Moxie replacement plus a lightweight
built-in PM system. Written up ahead of time so it's ready to build once Phase C
(admin panel basics) is done. See [`build-guide.md`](build-guide.md) for the overall
phase roadmap and [`README.md`](../README.md) for what's already live (marketing
site, diagnostic quiz, contact capture).

## Why this is built natively, not on Notion

Notion was considered for day-to-day PM but rejected for this specific system:

- **Client-facing writes with curated visibility** — a client needs to create a
  ticket and see only their own tickets plus a curated milestone feed, while the
  admin sees everything. Notion's sharing model is page/database-level; enforcing
  this would mean building a proxy layer in front of Notion anyway, which adds an
  API dependency without removing any of the real work.
- **Billing-gated workflow** — moving a ticket from review to To-Do sometimes
  requires a Stripe payment first. That logic has to live in this app and talk to
  Stripe directly; Notion has no concept of a payment gate between columns.
- **Public case studies** — the marketing site (Next.js + Supabase) needs to read
  published case studies on public page loads. Storing them in Supabase, where the
  site already looks, is simpler and faster than pulling from Notion's API on every
  request.

Supabase (already in use for `contacts`) extends naturally: Postgres + Auth + Row
Level Security cover everything this needs — relational data, per-client access
control, and a place the public site can query directly.

## Data model

Builds on the existing `contacts` table (see `0001_create_contacts.sql`) rather
than replacing it — a contact converts into a client without losing its lead
history.

```sql
-- A contact converts into a client. Client gets a Supabase Auth user (role: client)
-- for portal login; contact_id preserves the original lead record.
create table clients (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  contact_id uuid references contacts(id),
  auth_user_id uuid references auth.users(id),
  name text not null,
  company text,
  email text not null,
  status text not null default 'active' -- active | paused | offboarded
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  client_id uuid not null references clients(id),
  name text not null,
  status text not null default 'active' -- active | paused | completed
);

create table tickets (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  project_id uuid not null references projects(id),
  title text not null,
  description text,
  column_status text not null default 'client_request',
    -- client_request | needs_review | to_do | in_progress | done
  created_by_role text not null, -- 'client' | 'admin'
  created_by_client_id uuid references clients(id), -- set when created_by_role = 'client'
  billing_status text not null default 'n/a',
    -- n/a | needs_quote | quoted | paid
  stripe_payment_link text,
  is_milestone boolean not null default false, -- admin-flagged, shows in client's
                                                  -- "achievements" feed regardless
                                                  -- of who created the ticket
  published_at timestamptz -- set when is_milestone flips true, for feed ordering
);

create table case_studies (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  client_id uuid references clients(id), -- nullable: allow anonymized studies
  project_id uuid references projects(id),
  title text not null,
  summary text not null,       -- short, for the public card/teaser
  details text not null,       -- full write-up, admin-authored
  published boolean not null default false,
  published_at timestamptz
);

alter table clients enable row level security;
alter table projects enable row level security;
alter table tickets enable row level security;
alter table case_studies enable row level security;
```

### RLS policy approach

- **Admin (service role)** — all access, same pattern as the existing `/api/contact`
  and `/api/diagnostic` routes: server-only, service_role key, never exposed to the
  client. Admin dashboard reads/writes go through Next.js API routes, not direct
  client-side Supabase calls.
- **Client role** (`auth.uid()` matches `clients.auth_user_id`) — policy-scoped:
  - `projects`: select where `client_id` matches the caller's own client row
  - `tickets`: select where `project_id` belongs to one of the caller's projects,
    **and** (`created_by_client_id = caller's client_id` **or** `is_milestone = true`)
      — this single condition is what enforces "see your own tickets in full, plus
      curated milestones from everything else," with no second table needed
  - `tickets` insert: allowed only with `created_by_role = 'client'`,
    `created_by_client_id = caller's client_id`, `column_status = 'client_request'`,
    `billing_status = 'n/a'` — a client can open a request but cannot set its own
    billing status or drop it directly into `to_do`
  - `case_studies`: select where `published = true` (for the public site's use of
    the anon key, if the public case-study page reads directly; more likely the
    public site route uses the service role server-side instead, in which case this
    policy is a defense-in-depth backstop, not the only enforcement layer)

## Request → billing-gate → To-Do flow

1. Client opens a ticket in their portal → lands in **Client Request**,
   `billing_status = pending-review` is not a real value here — actually inserted
   as `billing_status = 'n/a'` and `column_status = 'client_request'` (billing status
   is only set once the admin has reviewed it and decided a fee applies).
2. Admin reviews in the admin dashboard. Two paths:
   - **In scope** → move directly to `to_do`, `billing_status` stays `n/a`.
   - **Needs a fee** → set `billing_status = 'needs_quote'`, generate a Stripe
     payment link (Stripe API, using the same Stripe account as the client
     invoicing/autopay work elsewhere in Phase D), store it on
     `stripe_payment_link`, `billing_status → 'quoted'`.
3. A Stripe webhook (`checkout.session.completed` or equivalent) flips
   `billing_status → 'paid'` and moves `column_status → 'to_do'` automatically —
   no manual step once the client pays.
4. Client portal always shows the ticket's current `column_status`, so they can see
   "waiting on payment" vs. "in progress" without you messaging them updates.

## Kanban UI

Recommend **`@dnd-kit/core`** for the drag-and-drop board (actively maintained,
unlike `react-beautiful-dnd` which is in maintenance mode) — columns bound to the
`column_status` enum, cards bound to `tickets` rows. Admin view renders all
columns; client view renders a reduced board (their own tickets across all
columns, since they need to track status) plus a separate "Recent Milestones"
feed (chronological, `is_milestone = true`, not a kanban column at all — mixing
curated wins into the same board as raw ticket columns would undercut the "not
every card" requirement).

## Public case studies

A `/results` (or similar) page on the marketing site, server-rendered from
`case_studies` where `published = true`. Likely also a condensed 2–3 card teaser
embedded near the CTA section on the homepage, linking out to the full page —
mirrors how the diagnostic quiz results reinforce the "Audit & Roadmap" / "Systems
Build" modules already on the site.

## Suggested build order within Phase D

1. `clients` + `projects` tables, admin CRUD (convert a contact → client, create a
   project) — no client-facing portal yet.
2. `tickets` table + admin-only Kanban board (internal use, proves the workflow
   before exposing it to clients).
3. Client auth (Supabase Auth, role: client) + client portal login.
4. Client-facing ticket creation + the curated milestone feed (the RLS policy
   above is the crux of this step).
5. Stripe billing gate (quote → payment link → webhook → auto-advance).
6. `case_studies` table + admin authoring UI + public `/results` page.

## Open decisions for later

- Exact Stripe product/integration approach for the billing gate — one-off payment
  links per ticket (simplest, matches "extra fee for a request") vs. itemized
  add-ons to an existing subscription, if clients end up on retainers.
- Whether `projects.status` needs finer states once there's real usage data (e.g.
  distinguishing "waiting on client" from "active").
- Notification delivery when a ticket changes status (Resend transactional email,
  reusing the infrastructure already built for the contact form and diagnostic
  quiz) — not designed in detail here, but the pieces already exist to wire it up.
