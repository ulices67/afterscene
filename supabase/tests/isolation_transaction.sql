-- Transactional isolation test. No test accounts or records survive rollback.
begin;
insert into auth.users (id) values ('11111111-2255-4000-8000-000000000001'),('11111111-2255-4000-8000-000000000002');
insert into public.user_archives (user_id,data) values ('11111111-2255-4000-8000-000000000001','{"owner":"A"}'),('11111111-2255-4000-8000-000000000002','{"owner":"B"}');
set local role authenticated;
set local request.jwt.claims = '{"sub":"11111111-2255-4000-8000-000000000001","role":"authenticated"}';
do $$
declare visible_count int; changed int;
begin
 select count(*) into visible_count from public.user_archives;
 if visible_count <> 1 then raise exception 'RLS isolation failed'; end if;
 update public.user_archives set data='{"intrusion":true}' where user_id='11111111-2255-4000-8000-000000000002';
 get diagnostics changed = row_count;
 if changed <> 0 then raise exception 'Cross-account update allowed'; end if;
 begin
  insert into public.user_archives(user_id,data) values('11111111-2255-4000-8000-000000000002','{}');
  raise exception 'Cross-account insert allowed';
 exception when insufficient_privilege then null;
 end;
 update public.user_archives set data='{"owner":"A","verified":true}' where user_id='11111111-2255-4000-8000-000000000001';
 get diagnostics changed = row_count;
 if changed <> 1 then raise exception 'Owner update failed'; end if;
end $$;
reset role;
select 'PASS: only own rows visible; own update allowed; other user insert and update denied' as isolation_result,
(select relrowsecurity and relforcerowsecurity from pg_class where oid='public.user_archives'::regclass) as rls_enforced,
not has_table_privilege('anon','public.user_archives','SELECT') as anonymous_blocked;
rollback;
