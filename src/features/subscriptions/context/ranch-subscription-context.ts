import { createContext, useContext } from "react";
import type { RanchSubscription } from "@/features/subscriptions/types";

/**
 * La suscripción de la estancia ya se consultó una vez en RequireActivePlan
 * para decidir si el usuario entra — se comparte por contexto para que el
 * layout y las páginas de adentro no tengan que volver a pedirla.
 */
export const RanchSubscriptionContext = createContext<RanchSubscription | null>(null);

export function useRanchSubscription(): RanchSubscription {
  const subscription = useContext(RanchSubscriptionContext);
  if (!subscription) {
    throw new Error("useRanchSubscription debe usarse dentro de RequireActivePlan");
  }
  return subscription;
}
