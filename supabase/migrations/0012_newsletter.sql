-- Clients get the same subscribed flag contacts already have, so the
-- newsletter feature's "always exclude unsubscribed" rule applies uniformly.
alter table clients add column if not exists subscribed boolean not null default true;

create table newsletters (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  subject text not null,
  body text not null,
  segment text not null, -- all | clients | newsletter | diagnostic
  sent_at timestamptz,
  recipient_count integer not null default 0
);

alter table newsletters enable row level security;
-- service_role only, same as clients/projects/tickets before their RLS policies existed.
