export const PLAN_IDS = ["free", "starter", "firm", "practice", "admin"] as const;
export type PlanId = (typeof PLAN_IDS)[number];
export type BillingCycle = "monthly" | "annual";

export type PlanEntitlement = {
  id: PlanId;
  name: string;
  monthlyPriceInr: number;
  monthlyLimit: number;
  features: string[];
};

export const PLAN_ENTITLEMENTS: Record<PlanId, PlanEntitlement> = {
  free: {
    id: "free",
    name: "Free",
    monthlyPriceInr: 0,
    monthlyLimit: 5,
    features: ["5 invoices / calendar month", "Supported IRP error mapping", "Safe format + arithmetic auto-fix"],
  },
  starter: {
    id: "starter",
    name: "CA Starter",
    monthlyPriceInr: 999,
    monthlyLimit: 100,
    features: ["100 invoices / month", "Bulk ZIP", "History", "Email support"],
  },
  firm: {
    id: "firm",
    name: "Firm",
    monthlyPriceInr: 2499,
    monthlyLimit: 400,
    features: ["400 invoices / month", "Bulk ZIP", "Priority support", "Team history"],
  },
  practice: {
    id: "practice",
    name: "Practice",
    monthlyPriceInr: 4999,
    monthlyLimit: 1500,
    features: ["1,500 invoices / month", "Bulk ZIP", "Named contact", "SLA on request"],
  },
  admin: {
    id: "admin",
    name: "Admin test mode",
    monthlyPriceInr: 0,
    monthlyLimit: 1_000_000,
    features: ["Complete product access", "1,000,000 test units / month", "Admin-only Command Center"],
  },
};

export function annualPriceInr(planId: PlanId): number {
  return PLAN_ENTITLEMENTS[planId].monthlyPriceInr * 10;
}

export function monthlyEquivalentInr(planId: PlanId): number {
  return annualPriceInr(planId) / 12;
}

export function planEntitlement(planId: PlanId | string | null | undefined): PlanEntitlement {
  return PLAN_ENTITLEMENTS[planId as PlanId] ?? PLAN_ENTITLEMENTS.free;
}
