-- Existing projects created title_reviews before rating-only posts were supported.
begin;
alter table public.title_reviews drop constraint if exists title_reviews_body_check;
alter table public.title_reviews add constraint title_reviews_body_check
  check (char_length(body) = 0 or char_length(body) between 20 and 2000);
revoke select on public.title_reviews from anon;
grant select (id, film_id, display_name, rating, body, created_at, updated_at)
  on public.title_reviews to anon;
commit;
