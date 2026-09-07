create table tickets (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  project_id uuid not null references projects(id),
  title text not null,
  description text,
  column_status text not null default 'client_request',
    -- client_request | needs_review | to_do | in_progress | done
  created_by_role text not null default 'admin', -- 'client' | 'admin'
  created_by_client_id uuid references clients(id), -- set when created_by_role = 'client'
  billing_status text not null default 'n/a',
    -- n/a | needs_quote | quoted | paid
  stripe_payment_link text,
  is_milestone boolean not null default false, -- admin-flagged, shows in client's
                                                 -- "achievements" feed regardless
                                                 -- of who created the ticket
  published_at timestamptz -- set when is_milestone flips true, for feed ordering
);

alter table tickets enable row level security;
-- (no policies yet — service_role only, via admin API routes. Client-role
-- policies get added once client portal auth exists, per the Phase D spec.)
