import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { accountRoleForEmail, type AccountRole } from "@/lib/auth/roles";
import { planEntitlement, type BillingCycle, type PlanId } from "@/lib/gst/plans";

export type Quota = {
  used: number;
  limit: number;
  remaining: number;
  monthKey: string;
  planId: PlanId;
  planName: string;
  billingCycle: BillingCycle;
  role: AccountRole;
  status: string;
};

export type ConversionRow = {
  id: number;
  invoiceId: string;
  supplier: string;
  customer: string;
  total: string;
  currency: string;
  status: string;
  createdAt: string;
};

type AccountPlan = {
  planId: PlanId;
  billingCycle: BillingCycle;
  status: string;
  role: AccountRole;
};

async function resolveAccountPlan(sql: Awaited<ReturnType<typeof getSql>>, userId: string): Promise<AccountPlan> {
  const rows = await sql<{
    email: string;
    plan_id: PlanId | null;
    billing_cycle: BillingCycle | null;
    status: string | null;
  }>`
    select u.email,
           ap.plan_id,
           ap.billing_cycle,
           coalesce(ap.status, 'active') as status
    from "user" u
    left join public.account_plans ap on ap.user_id = u.id
    where u.id = ${userId}
    limit 1
  `;
  const email = rows[0]?.email ?? null;
  const role = accountRoleForEmail(email);
  const planId = role === "admin" ? "admin" : rows[0]?.plan_id ?? "free";
  const billingCycle = rows[0]?.billing_cycle ?? "monthly";
  const status = rows[0]?.status ?? "active";
  return { planId, billingCycle, status, role };
}

async function quotaForUser(sql: Awaited<ReturnType<typeof getSql>>, userId: string): Promise<Quota> {
  const account = await resolveAccountPlan(sql, userId);
  const entitlement = planEntitlement(account.planId);
  const rows = await sql<{ n: number }>`
    select count(*)::int as n
    from conversions
    where user_id = ${userId}
      and created_at >= date_trunc('month', now())
  `;
  const used = Number(rows[0]?.n ?? 0);
  const now = new Date();
  const monthKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  return {
    used,
    limit: entitlement.monthlyLimit,
    remaining: Math.max(0, entitlement.monthlyLimit - used),
    monthKey,
    planId: entitlement.id,
    planName: entitlement.name,
    billingCycle: account.billingCycle,
    role: account.role,
    status: account.status,
  };
}

export const getQuota = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => quotaForUser(await getSql(), context.userId));

export const listConversions = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{
      id: number;
      invoice_id: string;
      supplier: string;
      customer: string;
      total: string;
      currency: string;
      status: string;
      created_at: string;
    }>`
      select id, invoice_id, supplier, customer, total, currency, status, created_at
      from conversions
      where user_id = ${context.userId}
      order by created_at desc
      limit 50
    `;
    return rows.map((r) => ({
      id: r.id,
      invoiceId: r.invoice_id,
      supplier: r.supplier,
      customer: r.customer,
      total: r.total,
      currency: r.currency,
      status: r.status,
      createdAt: String(r.created_at),
    }) satisfies ConversionRow);
  });

export const saveConversion = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { invoiceId: string; supplier: string; customer: string; total: string; currency: string; status: string }) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const account = await resolveAccountPlan(sql, context.userId);
    const entitlement = planEntitlement(account.planId);
    if (account.status !== "active") throw new Error("Your subscription is not active. Please review your plan before downloading.");

    const inserted = await sql<{ id: number }>`
      select public.consume_conversion(
        ${context.userId},
        ${data.invoiceId},
        ${data.supplier},
        ${data.customer},
        ${data.total},
        ${data.currency},
        ${data.status},
        ${entitlement.monthlyLimit}
      ) as id
    `;
    const id = Number(inserted[0]?.id ?? 0);
    if (!id) throw new Error("Conversion could not be saved.");
    const quota = await quotaForUser(sql, context.userId);
    return { id, ...quota };
  });
