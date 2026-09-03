create table posts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz not null default now(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null,
  published boolean not null default false,
  published_at timestamptz
);

alter table posts enable row level security;
-- (no policies created = no public access at all, by design — reads and
-- writes both go through server-side API routes using the service_role key)
