-- Per-user conversion history. Monthly quota = count of rows in the current calendar month.
create table if not exists conversions (
  id serial primary key,
  user_id text not null,
  invoice_id text not null default '',
  supplier text not null default '',
  customer text not null default '',
  total text not null default '',
  currency text not null default 'EUR',
  status text not null default 'ok',
  created_at timestamptz not null default now()
);

create index if not exists conversions_user_id_idx on conversions (user_id);
create index if not exists conversions_user_month_idx on conversions (user_id, created_at desc);
