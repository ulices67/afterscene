-- AFTERSCENE v1 · atomic, per-account archive snapshots.
-- Run in a dedicated Supabase project. No service-role key belongs in the browser.
begin;
create table if not exists public.user_archives (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint archive_is_object check (jsonb_typeof(data) = 'object'),
  constraint archive_size_limit check (octet_length(data::text) <= 20000000)
);
alter table public.user_archives enable row level security;
alter table public.user_archives force row level security;
revoke all on public.user_archives from anon;
grant select, insert, update, delete on public.user_archives to authenticated;
create policy "Read own archive" on public.user_archives for select to authenticated using ((select auth.uid()) = user_id);
create policy "Create own archive" on public.user_archives for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Update own archive" on public.user_archives for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Delete own archive" on public.user_archives for delete to authenticated using ((select auth.uid()) = user_id);
commit;
