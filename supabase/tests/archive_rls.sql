-- Execute after applying the migration, using supabase test db (pgTAP enabled).
begin;
select plan(6);
select has_table('public', 'user_archives', 'Archive table exists');
select ok((select relrowsecurity from pg_class where oid = 'public.user_archives'::regclass), 'RLS is enabled');
select ok((select relforcerowsecurity from pg_class where oid = 'public.user_archives'::regclass), 'RLS is forced');
select is((select count(*)::int from pg_policies where schemaname='public' and tablename='user_archives'), 4, 'Each operation has an owner policy');
select ok(not has_table_privilege('anon','public.user_archives','SELECT'), 'Anonymous reads are denied');
select ok(not has_table_privilege('anon','public.user_archives','INSERT'), 'Anonymous writes are denied');
select * from finish();
rollback;
