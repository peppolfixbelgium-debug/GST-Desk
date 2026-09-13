-- India-first data defaults and defensive constraints.
-- Existing rows are preserved; only future inserts use INR by default.

alter table if exists conversions
  alter column currency set default 'INR';

-- Keep the currency field bounded to ISO 4217-style three-letter codes.
-- The constraint is intentionally case-normalized at write time by the app;
-- existing data is not rewritten by this migration.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'conversions_currency_format_chk'
  ) then
    alter table conversions
      add constraint conversions_currency_format_chk
      check (currency ~ '^[A-Z]{3}$');
  end if;
end $$;

-- Common quota/history query is user + month scoped; this index avoids a
-- full-history scan as the conversion table grows.
create index if not exists conversions_user_created_at_idx
  on conversions (user_id, created_at desc);
