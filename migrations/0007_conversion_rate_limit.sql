-- Bound authenticated conversion writes in addition to the monthly plan quota.
-- Processing and validation happen locally in the browser; this protects the
-- persisted conversion boundary from bursty/replayed writes.

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
  v_recent integer;
  v_id bigint;
  v_month_start timestamptz := date_trunc('month', now());
  v_window_start timestamptz := now() - interval '1 minute';
begin
  if nullif(trim(p_user_id), '') is null then
    raise exception using message = 'Authenticated user is required', errcode = '28000';
  end if;
  if p_monthly_limit < 1 then
    raise exception using message = 'Invalid monthly quota', errcode = '22023';
  end if;

  -- One lock covers both the burst check and monthly quota check, so concurrent
  -- requests cannot race around either boundary.
  perform pg_advisory_xact_lock(hashtextextended('conversion:' || p_user_id, 0));

  select count(*)::int into v_recent
  from public.conversions
  where user_id = p_user_id
    and created_at >= v_window_start;

  if v_recent >= 60 then
    raise exception using
      message = 'Conversion rate limit reached. Please wait a moment and try again.',
      errcode = 'P0001';
  end if;

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

revoke all on function public.consume_conversion(text,text,text,text,text,text,text,integer)
  from public, anon, authenticated;
