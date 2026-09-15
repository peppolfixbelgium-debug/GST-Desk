-- Server-side plan state. Payment providers can update this table after checkout/webhook verification.
-- Missing rows intentionally resolve to the free plan.
create table if not exists public.account_plans (
  user_id text primary key,
  plan_id text not null default 'free' check (plan_id in ('free', 'starter', 'firm', 'practice', 'admin')),
  billing_cycle text not null default 'monthly' check (billing_cycle in ('monthly', 'annual')),
  status text not null default 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists account_plans_plan_id_idx on public.account_plans (plan_id);

-- The founder account is always admin test mode. This is deliberately keyed to
-- the verified Better Auth email rather than a user id so it remains stable if
-- the OAuth account is recreated.
insert into public.account_plans (user_id, plan_id, billing_cycle, status, updated_at)
select id, 'admin', 'annual', 'active', now()
from "user"
where lower(email) = 'peppolfixbelgium@gmail.com'
on conflict (user_id) do update
set plan_id = excluded.plan_id,
    billing_cycle = excluded.billing_cycle,
    status = excluded.status,
    updated_at = now();
