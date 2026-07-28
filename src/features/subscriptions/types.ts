// Tipos de suscripcion compartidos entre el panel admin (features/admin) y el
// gate de acceso para usuarios de pago (features/subscription-gate) — ambos
// consumen la misma forma de RanchSubscription, solo por endpoints distintos
// (/admin/subscriptions/* vs /subscriptions/my-ranch/:idRanch).
export type SubscriptionEffectiveStatus = "trial" | "active" | "expired" | "cancelled";
export type BillingCycle = "monthly" | "annual";
export type PaymentMethod = "qr" | "transfer";

export const FREE_PLAN_ID = 1;

// Rubros de producción — misma numeración que el catálogo del backend
// (production_types). Nunca puede haber Engorde sin Recría, ni Recría sin
// Cría (RN-09) — se valida al crear la estancia, así que alcanza con chequear
// si el id está presente en la lista para saber si el módulo aplica.
export const PRODUCTION_TYPE_IDS = {
  CRIA: 1,
  RECRIA: 2,
  ENGORDE: 3,
} as const;

export interface RanchProductionType {
  id: number;
  name: string;
}

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
  productionTypes: RanchProductionType[];
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

/** Plan pago (no Free) y en un estado que permite acceso (trial o active). */
export function hasActivePaidPlan(subscription: RanchSubscription): boolean {
  return subscription.idPlan !== FREE_PLAN_ID && (subscription.effectiveStatus === "active" || subscription.effectiveStatus === "trial");
}

/** El rubro está habilitado para esta estancia (Recría/Engorde) — Sanidad y Movimientos no son rubros, siempre aplican. */
export function hasProductionType(ranch: SubscriptionRanch, idProductionType: number): boolean {
  return ranch.productionTypes.some((pt) => pt.id === idProductionType);
}
