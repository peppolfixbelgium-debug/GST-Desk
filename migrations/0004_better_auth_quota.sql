-- Production Postgres identity is Better Auth's text user id, not Supabase Auth UUIDs.
-- RLS remains enabled as defense in depth for clients using Supabase Auth; the app's
-- server path enforces tenant scope through authMiddleware and parameterized user_id.

drop policy if exists "Users can read their own conversions" on public.conversions;
drop policy if exists "Users can insert their own conversions" on public.conversions;
drop policy if exists "Users can delete their own conversions" on public.conversions;

alter table if exists public.conversions
  drop constraint if exists conversions_user_id_fkey;

alter table if exists public.conversions
  alter column user_id type text using user_id::text;

alter table if exists public.conversions
  alter column currency set default 'INR';

create policy "Users can read their own conversions" on public.conversions
  for select to authenticated
  using ((select auth.uid())::text = user_id);

create policy "Users can insert their own conversions" on public.conversions
  for insert to authenticated
  with check ((select auth.uid())::text = user_id);

create policy "Users can delete their own conversions" on public.conversions
  for delete to authenticated
  using ((select auth.uid())::text = user_id);

-- Serialize quota consumption per user/month so concurrent requests cannot
-- both observe the same remaining slot and exceed FREE_MONTHLY_LIMIT.
create or replace function public.consume_conversion(
  p_user_id text,
  p_invoice_id text,
  p_supplier text,
  p_customer text,
  p_total text,
  p_currency text,
  p_status text,
  p_monthly_limit integer default 10
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_used integer;
  v_id bigint;
  v_month_start timestamptz := date_trunc('month', now());
begin
  if nullif(trim(p_user_id), '') is null then
    raise exception using message = 'Authenticated user is required', errcode = '28000';
  end if;
  if p_monthly_limit < 1 then
    raise exception using message = 'Invalid monthly quota', errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(p_user_id || ':' || to_char(v_month_start, 'YYYY-MM-DD'), 0)
  );

  select count(*)::int into v_used
  from public.conversions
  where user_id = p_user_id
    and created_at >= v_month_start;

  if v_used >= p_monthly_limit then
    raise exception using
      message = 'Monthly free quota reached. It resets on the 1st of next month.',
      errcode = 'P0001';
  end if;

  insert into public.conversions (
    user_id, invoice_id, supplier, customer, total, currency, status
  ) values (
    p_user_id, p_invoice_id, p_supplier, p_customer, p_total, upper(p_currency), p_status
  ) returning id into v_id;

  return v_id;
end;
$$;

-- The function is intentionally callable only by the trusted application DB role.
-- The app uses its authenticated Better Auth context to supply p_user_id.
revoke all on function public.consume_conversion(text,text,text,text,text,text,text,integer)
  from public, anon, authenticated;
