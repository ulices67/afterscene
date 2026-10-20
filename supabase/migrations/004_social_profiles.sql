begin;
create table public.community_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 45),
  bio text not null default '' check (char_length(bio) <= 240),
  avatar text not null default '' check (char_length(avatar) <= 3000000),
  banner text not null default '' check (char_length(banner) <= 3000000),
  background text not null default '' check (char_length(background) <= 3000000),
  genres text[] not null default '{}',
  collections jsonb not null default '[]' check (jsonb_typeof(collections) = 'array'),
  activity jsonb not null default '[]' check (jsonb_typeof(activity) = 'array'),
  is_public boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table public.community_profiles enable row level security;
grant select on public.community_profiles to anon, authenticated;
grant insert, update, delete on public.community_profiles to authenticated;
create policy "Read public profiles or own profile" on public.community_profiles for select using (is_public or id = (select auth.uid()));
create policy "Create own profile" on public.community_profiles for insert to authenticated with check (id = (select auth.uid()));
create policy "Update own profile" on public.community_profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy "Delete own profile" on public.community_profiles for delete to authenticated using (id = (select auth.uid()));
create table public.community_follows (
  follower uuid not null references auth.users(id) on delete cascade,
  following uuid not null references public.community_profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(follower,following),
  check (follower <> following)
);
alter table public.community_follows enable row level security;
grant select,insert,delete on public.community_follows to authenticated;
create policy "Read own follows or public followers" on public.community_follows for select to authenticated using (
  follower = (select auth.uid()) or exists (select 1 from public.community_profiles p where p.id = following and p.is_public)
);
create policy "Follow public profiles" on public.community_follows for insert to authenticated with check (
  follower = (select auth.uid()) and exists (select 1 from public.community_profiles p where p.id = following and p.is_public)
);
create policy "Unfollow" on public.community_follows for delete to authenticated using (follower = (select auth.uid()));
-- Only reviews belonging to an explicitly public profile are exposed by this function.
create function public.community_reviews(profile_id uuid)
returns table(id uuid,film_id text,display_name text,rating smallint,body text,created_at timestamptz)
language sql stable security definer set search_path = public
as $$
  select r.id,r.film_id,r.display_name,r.rating,r.body,r.created_at
  from public.title_reviews r join public.community_profiles p on p.id = r.user_id
  where p.id = profile_id and (p.is_public or p.id = auth.uid())
  order by r.created_at desc limit 50;
$$;
revoke all on function public.community_reviews(uuid) from public;
grant execute on function public.community_reviews(uuid) to anon,authenticated;
commit;
