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
