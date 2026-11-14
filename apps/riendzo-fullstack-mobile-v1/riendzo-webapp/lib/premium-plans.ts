/**
 * Premium plans (pure data: used by the popup and by the server, which always re-reads the price from here).
 * To change prices or add plans, edit only this list. Prices are in meticais (MZN).
 */
export type PremiumPlan = { id: string; months: number; price: number; label: string };

export const PREMIUM_PLANS: PremiumPlan[] = [
    { id: "1m", months: 1, price: 150, label: "1 mês" },
    { id: "3m", months: 3, price: 400, label: "3 meses" },
    { id: "6m", months: 6, price: 750, label: "6 meses" },
    { id: "12m", months: 12, price: 1400, label: "12 meses" },
];

export const planById = (id: unknown) => PREMIUM_PLANS.find((p) => p.id === id);
/** What the same months would cost paying month by month (to show the saving). */
export const saving = (p: PremiumPlan) => Math.max(0, PREMIUM_PLANS[0].price * p.months - p.price);
