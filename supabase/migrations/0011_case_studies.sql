create table case_studies (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  client_id uuid references clients(id) on delete set null, -- nullable: allow anonymized studies
  project_id uuid references projects(id) on delete set null,
  title text not null,
  title_es text,
  slug text not null unique,
  summary text not null,       -- short, for the public card/teaser
  summary_es text,
  details text not null,       -- full write-up, admin-authored
  details_es text,
  published boolean not null default false,
  published_at timestamptz
);

alter table case_studies enable row level security;

-- Defense-in-depth only: the public /results pages read via service_role
-- server-side, same pattern as /blog. This matters only if a direct
-- browser-to-Supabase read is ever added later.
create policy "anyone can read published case studies"
  on case_studies for select
  using (published = true);
