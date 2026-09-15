import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { FREE_MONTHLY_LIMIT } from "@/lib/gst/types";

export type Quota = {
  used: number;
  limit: number;
  remaining: number;
  monthKey: string;
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

export const getQuota = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{ n: number }>`
      select count(*)::int as n
      from conversions
      where user_id = ${context.userId}
        and created_at >= date_trunc('month', now())
    `;
    const used = Number(rows[0]?.n ?? 0);
    const now = new Date();
    const monthKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
    return {
      used,
      limit: FREE_MONTHLY_LIMIT,
      remaining: Math.max(0, FREE_MONTHLY_LIMIT - used),
      monthKey,
    } satisfies Quota;
  });

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
    return rows.map(
      (r) =>
        ({
          id: r.id,
          invoiceId: r.invoice_id,
          supplier: r.supplier,
          customer: r.customer,
          total: r.total,
          currency: r.currency,
          status: r.status,
          createdAt: String(r.created_at),
        }) satisfies ConversionRow,
    );
  });

export const saveConversion = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { invoiceId: string; supplier: string; customer: string; total: string; currency: string; status: string }) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const inserted = await sql<{ id: number }>`
      select public.consume_conversion(
        ${context.userId},
        ${data.invoiceId},
        ${data.supplier},
        ${data.customer},
        ${data.total},
        ${data.currency},
        ${data.status},
        ${FREE_MONTHLY_LIMIT}
      ) as id
    `;
    const id = Number(inserted[0]?.id ?? 0);
    if (!id) throw new Error("Conversion could not be saved.");
    const countRows = await sql<{ n: number }>`
      select count(*)::int as n
      from conversions
      where user_id = ${context.userId}
        and created_at >= date_trunc('month', now())
    `;
    const used = Number(countRows[0]?.n ?? 0);
    return { id, used, remaining: Math.max(0, FREE_MONTHLY_LIMIT - used) };
  });
