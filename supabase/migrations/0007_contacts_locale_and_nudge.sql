alter table contacts add column if not exists locale text not null default 'en';
alter table contacts add column if not exists nudge_sent_at timestamptz;
