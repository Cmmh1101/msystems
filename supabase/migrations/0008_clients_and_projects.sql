-- A contact converts into a client. Client gets a Supabase Auth user (role: client)
-- for portal login in a later phase; contact_id preserves the original lead record.
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

alter table clients enable row level security;
alter table projects enable row level security;
-- (no policies yet — service_role only, via admin API routes. Client-role
-- policies get added in a later Phase D step once client portal auth exists.)
