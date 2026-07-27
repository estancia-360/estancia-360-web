import { useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router";
import { Spinner } from "@/components/ui/spinner";
import { getMyRanchSubscription } from "@/features/subscriptions/api/my-ranch-api";
import { hasActivePaidPlan, type RanchSubscription } from "@/features/subscriptions/types";
import { RanchSubscriptionContext } from "@/features/subscriptions/context/ranch-subscription-context";
import { PlanRequiredPage } from "@/features/subscriptions/pages/plan-required-page";
import { NoRanchPage } from "@/features/ranch/pages/no-ranch-page";
import { readSelectedRanchId } from "@/features/ranch/lib/selected-ranch-storage";
import { useAuth } from "@/features/auth/context/use-auth";

/**
 * Gatea el acceso al panel de usuario: sin ninguna estancia propia →
 * NoRanchPage; con estancias pero sin una elegida todavía (o la guardada ya
 * no es una de las suyas) → manda a elegir en /ranches, porque cada estancia
 * puede tener un plan de suscripción distinto y el chequeo de plan es por
 * estancia, no por usuario. Con estancia elegida pero sin plan pago activo
 * (Free, vencida o cancelada) → PlanRequiredPage. Recién si pasa todo expone
 * la suscripción por contexto para que el layout y las páginas de adentro no
 * vuelvan a pedirla.
 */
export function RequireActivePlan({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const ranches = session?.ranches ?? [];
  const selectedRanchId = readSelectedRanchId();
  const idRanch = selectedRanchId !== null && ranches.some((r) => r.id === selectedRanchId) ? selectedRanchId : null;
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

  // Sin ninguna estancia propia: no hay nada para elegir.
  if (ranches.length === 0) {
    return <NoRanchPage />;
  }

  // Tiene estancias pero todavía no eligió una (o la guardada es inválida).
  if (!idRanch) {
    return <Navigate to="/ranches" replace />;
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
