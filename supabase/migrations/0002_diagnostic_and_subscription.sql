create table diagnostic_results (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  contact_id uuid references contacts(id),
  email text not null,
  name text,
  company text,
  answers jsonb not null,
  score int not null,
  tier text not null
);

alter table diagnostic_results enable row level security;
-- (no policies created = no public access at all, by design — server-only via service_role)

alter table contacts add column if not exists newsletter_opt_in boolean not null default true;
alter table contacts add column if not exists subscribed boolean not null default true;
