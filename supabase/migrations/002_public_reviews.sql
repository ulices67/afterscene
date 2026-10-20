-- Published reviews are separate from the private user_archives table.
begin;
create table if not exists public.title_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  film_id text not null check (film_id ~ '^[a-zA-Z0-9-]{1,100}$'),
  display_name text not null check (char_length(display_name) between 1 and 45),
  rating smallint not null check (rating between 1 and 10),
  body text not null default '' check (char_length(body) = 0 or char_length(body) between 20 and 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, film_id)
);
create index if not exists title_reviews_film_recent on public.title_reviews (film_id, created_at desc);
alter table public.title_reviews enable row level security;
alter table public.title_reviews force row level security;
revoke all on public.title_reviews from anon, authenticated;
grant select (id, film_id, display_name, rating, body, created_at, updated_at) on public.title_reviews to anon;
grant select on public.title_reviews to authenticated;
grant insert, update, delete on public.title_reviews to authenticated;
create policy "Anyone can read published reviews" on public.title_reviews for select to anon, authenticated using (true);
create policy "Members can publish their own reviews" on public.title_reviews for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Members can edit their own reviews" on public.title_reviews for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Members can remove their own reviews" on public.title_reviews for delete to authenticated using ((select auth.uid()) = user_id);
commit;
