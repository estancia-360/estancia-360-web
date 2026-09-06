// Tipos de suscripcion compartidos entre el panel admin (features/admin) y el
// gate de acceso para usuarios de pago (features/subscription-gate) — ambos
// consumen la misma forma de RanchSubscription, solo por endpoints distintos
// (/admin/subscriptions/* vs /subscriptions/my-ranch/:idRanch).
export type SubscriptionEffectiveStatus = "trial" | "active" | "expired" | "cancelled";
export type BillingCycle = "monthly" | "annual";
export type PaymentMethod = "qr" | "transfer";

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

/**
 * Plan pago (no Free) y en un estado que permite acceso (trial o active).
 *
 * 12e (auditoria QA E2E, 2026-09-03): antes comparaba subscription.idPlan contra un
 * FREE_PLAN_ID=1 hardcodeado — frágil si el catálogo de planes cambia de orden en algún
 * entorno. "Free" se identifica por precio (priceMonthly === 0), no por un ID fijo.
 */
export function hasActivePaidPlan(subscription: RanchSubscription): boolean {
  return subscription.plan.priceMonthly > 0 && (subscription.effectiveStatus === "active" || subscription.effectiveStatus === "trial");
}

/** El rubro está habilitado para esta estancia (Recría/Engorde) — Sanidad y Movimientos no son rubros, siempre aplican. */
export function hasProductionType(ranch: SubscriptionRanch, idProductionType: number): boolean {
  return ranch.productionTypes.some((pt) => pt.id === idProductionType);
}
