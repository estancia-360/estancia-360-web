export type SubscriptionEffectiveStatus = "trial" | "active" | "expired" | "cancelled";
export type BillingCycle = "monthly" | "annual";
export type PaymentMethod = "qr" | "transfer";

export interface SubscriptionPlan {
  id: number;
  name: string;
  capacityMin: number;
  capacityMax: number | null;
  priceMonthly: number;
  priceAnnual: number;
  trialDays: number;
  isActive: boolean;
}

export interface SubscriptionRanch {
  id: number;
  name: string;
}

export interface RanchSubscription {
  id: number;
  idRanch: number;
  ranch: SubscriptionRanch;
  idPlan: number;
  billingCycle: BillingCycle | null;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  cancelledAt: string | null;
  effectiveStatus: SubscriptionEffectiveStatus;
  plan: SubscriptionPlan;
  createdAt: string;
}

export interface SubscriptionMetrics {
  activeClients: number;
  mrr: number;
  byPlan: Array<{ idPlan: number; name: string; count: number }>;
}
