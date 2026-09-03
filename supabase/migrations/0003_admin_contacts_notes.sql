alter table contacts add column if not exists notes text;
alter table contacts add column if not exists updated_at timestamptz not null default now();
