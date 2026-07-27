import { useEffect, useState, type ReactNode } from "react";
import { Spinner } from "@/components/ui/spinner";
import { getMyRanchSubscription } from "@/features/subscriptions/api/my-ranch-api";
import { hasActivePaidPlan, type RanchSubscription } from "@/features/subscriptions/types";
import { RanchSubscriptionContext } from "@/features/subscriptions/context/ranch-subscription-context";
import { PlanRequiredPage } from "@/features/subscriptions/pages/plan-required-page";
import { NoRanchPage } from "@/features/ranch/pages/no-ranch-page";
import { useAuth } from "@/features/auth/context/use-auth";

/**
 * Gatea el acceso al panel de usuario: sin estancia propia (idRanch null,
 * el login solo la setea cuando el usuario es Owner) → NoRanchPage; con
 * estancia pero sin plan pago activo (Free, vencida o cancelada) →
 * PlanRequiredPage. Recién si pasa ambos chequeos expone la suscripción por
 * contexto para que el layout y las páginas de adentro no vuelvan a pedirla.
 */
export function RequireActivePlan({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const idRanch = session?.idRanch ?? null;
  const [subscription, setSubscription] = useState<RanchSubscription | null>(null);
  const [status, setStatus] = useState<"loading" | "allowed" | "blocked">("loading");

  useEffect(() => {
    if (!idRanch || !session) return;
    let cancelled = false;
    getMyRanchSubscription(idRanch, session.accessToken)
      .then(({ subscription }) => {
        if (cancelled) return;
        setSubscription(subscription);
        setStatus(hasActivePaidPlan(subscription) ? "allowed" : "blocked");
      })
      .catch(() => {
        if (cancelled) return;
        setSubscription(null);
        setStatus("blocked");
      });
    return () => {
      cancelled = true;
    };
  }, [idRanch, session]);

  // Sin estancia: no hay nada que consultar y no hay suscripción que poner en
  // contexto — children (RanchLayout) asume que sí la hay, así que corta acá.
  if (!idRanch) {
    return <NoRanchPage />;
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-cream">
        <Spinner className="size-6 text-brand-blue" />
      </div>
    );
  }

  if (status === "blocked") {
    return <PlanRequiredPage subscription={subscription} />;
  }

  return <RanchSubscriptionContext.Provider value={subscription}>{children}</RanchSubscriptionContext.Provider>;
}
