export const PLAN = {
  free: { cards: 1, leadCapPerMonth: 50, exportCsv: false, removeBranding: false, priceLabel: "Free" },
  pro: { cards: 10, leadCapPerMonth: Infinity, exportCsv: true, removeBranding: true, priceLabel: "Pro" },
} as const;

export type PlanName = keyof typeof PLAN;

export function planOf(p: string) {
  return (PLAN as Record<string, (typeof PLAN)[keyof typeof PLAN]>)[p] ?? PLAN.free;
}

export const PRICING = {
  proMonthlyUsd: 5,
  proYearlyUsd: 49,
  checkoutBase: process.env.PADDLE_CHECKOUT_URL || "https://pay.wpistic.com",
  proMonthlyPriceId: process.env.PADDLE_PRO_MONTHLY_PRICE_ID || "",
  proYearlyPriceId: process.env.PADDLE_PRO_YEARLY_PRICE_ID || "",
};
