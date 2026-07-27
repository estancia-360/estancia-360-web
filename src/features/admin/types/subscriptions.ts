export type { SubscriptionEffectiveStatus, BillingCycle, PaymentMethod, SubscriptionPlan, SubscriptionRanch, RanchSubscription } from "@/features/subscriptions/types";

export interface SubscriptionMetrics {
  activeClients: number;
  mrr: number;
  byPlan: Array<{ idPlan: number; name: string; count: number }>;
}
