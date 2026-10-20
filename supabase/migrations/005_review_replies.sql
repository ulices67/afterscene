begin;
create table public.review_replies (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.title_reviews(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null check(char_length(display_name) between 1 and 45),
  body text not null check(char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);
alter table public.review_replies enable row level security;
revoke all on public.review_replies from anon,authenticated;
grant select(id,review_id,display_name,body,created_at) on public.review_replies to anon;
grant select,insert,delete on public.review_replies to authenticated;
create policy "Read replies" on public.review_replies for select using(true);
create policy "Write own replies" on public.review_replies for insert to authenticated with check(user_id=(select auth.uid()));
create policy "Delete own replies" on public.review_replies for delete to authenticated using(user_id=(select auth.uid()));
create table public.member_notifications (
  id uuid primary key default gen_random_uuid(),
  recipient uuid not null references auth.users(id) on delete cascade,
  film_id text not null,
  message text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.member_notifications enable row level security;
grant select on public.member_notifications to authenticated;
grant update(read_at) on public.member_notifications to authenticated;
create policy "Read own notifications" on public.member_notifications for select to authenticated using(recipient=(select auth.uid()));
create policy "Read receipt own notifications" on public.member_notifications for update to authenticated using(recipient=(select auth.uid())) with check(recipient=(select auth.uid()));
create function public.notify_review_reply() returns trigger
language plpgsql security definer set search_path=public as $$
begin
  insert into public.member_notifications(recipient,film_id,message)
    select user_id,film_id,new.display_name || ' respondió a tu reseña'
    from public.title_reviews where id=new.review_id and user_id<>new.user_id;
  return new;
end;$$;
revoke all on function public.notify_review_reply() from public;
create trigger notify_review_reply after insert on public.review_replies for each row execute function public.notify_review_reply();
create index review_replies_thread on public.review_replies(review_id,created_at);
create index member_notifications_inbox on public.member_notifications(recipient,created_at desc);
commit;
