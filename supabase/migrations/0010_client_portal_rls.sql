alter table clients add column if not exists locale text not null default 'en';

-- Client-role RLS policies. These are defense-in-depth: the actual portal
-- pages go through Next.js server routes using the service_role client with
-- explicit ownership filters in code (same pattern as /admin/*), never a
-- direct browser-to-Supabase call. These policies matter if that ever
-- changes, and match the Phase D spec exactly.

create policy "clients can read their own row"
  on clients for select
  using (auth.uid() = auth_user_id);

create policy "clients can read their own projects"
  on projects for select
  using (
    client_id in (select id from clients where auth_user_id = auth.uid())
  );

create policy "clients can read their own tickets or any milestone"
  on tickets for select
  using (
    project_id in (
      select id from projects where client_id in (
        select id from clients where auth_user_id = auth.uid()
      )
    )
    and (
      created_by_client_id in (select id from clients where auth_user_id = auth.uid())
      or is_milestone = true
    )
  );

create policy "clients can create their own ticket requests"
  on tickets for insert
  with check (
    created_by_role = 'client'
    and created_by_client_id in (select id from clients where auth_user_id = auth.uid())
    and column_status = 'client_request'
    and billing_status = 'n/a'
    and project_id in (
      select id from projects where client_id in (
        select id from clients where auth_user_id = auth.uid()
      )
    )
  );
