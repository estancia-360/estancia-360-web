import { apiFetch } from "@/lib/api-client";
import type {
  BillingCycle,
  PaymentMethod,
  RanchSubscription,
  SubscriptionMetrics,
  SubscriptionPlan,
} from "@/features/admin/types/subscriptions";

export function getPlans(): Promise<{ plans: SubscriptionPlan[] }> {
  return apiFetch("/subscription-plans");
}

export function getAllSubscriptions(accessToken: string): Promise<{ subscriptions: RanchSubscription[] }> {
  return apiFetch("/admin/subscriptions", { accessToken });
}

export function getMetrics(accessToken: string): Promise<SubscriptionMetrics> {
  return apiFetch("/admin/subscriptions/metrics", { accessToken });
}

export function getSubscription(idRanch: number, accessToken: string): Promise<{ subscription: RanchSubscription }> {
  return apiFetch(`/admin/subscriptions/${idRanch}`, { accessToken });
}

export interface ActivatePlanInput {
  idPlan: number;
  billingCycle?: BillingCycle;
}

export function activatePlan(
  idRanch: number,
  data: ActivatePlanInput,
  accessToken: string,
): Promise<{ subscription: RanchSubscription }> {
  return apiFetch(`/admin/subscriptions/${idRanch}/activate`, {
    method: "POST",
    body: data,
    accessToken,
  });
}

export interface RegisterPaymentInput {
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  periodExtendedMonths: number;
  externalReference?: string;
  notes?: string;
  localId?: string;
}

export function registerPayment(
  idRanch: number,
  data: RegisterPaymentInput,
  accessToken: string,
): Promise<{ subscription: RanchSubscription }> {
  return apiFetch(`/admin/subscriptions/${idRanch}/payments`, {
    method: "POST",
    body: data,
    accessToken,
  });
}

export function cancelSubscription(idRanch: number, accessToken: string): Promise<{ subscription: RanchSubscription }> {
  return apiFetch(`/admin/subscriptions/${idRanch}/cancel`, {
    method: "PATCH",
    accessToken,
  });
}
