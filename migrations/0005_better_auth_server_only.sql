-- Better Auth is server-only in GST Desk. Public Supabase client roles must never
-- read or mutate identity/session/token tables. The trusted application DB role
-- remains responsible for Better Auth operations.

alter table if exists public."user" enable row level security;
alter table if exists public.session enable row level security;
alter table if exists public.account enable row level security;
alter table if exists public.verification enable row level security;

drop policy if exists "Better Auth user is server-only" on public."user";
drop policy if exists "Better Auth session is server-only" on public.session;
drop policy if exists "Better Auth account is server-only" on public.account;
drop policy if exists "Better Auth verification is server-only" on public.verification;

create policy "Better Auth user is server-only" on public."user"
  for all to anon, authenticated using (false) with check (false);
create policy "Better Auth session is server-only" on public.session
  for all to anon, authenticated using (false) with check (false);
create policy "Better Auth account is server-only" on public.account
  for all to anon, authenticated using (false) with check (false);
create policy "Better Auth verification is server-only" on public.verification
  for all to anon, authenticated using (false) with check (false);
