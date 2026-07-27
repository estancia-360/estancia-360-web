import { useEffect, useState, type ReactNode } from "react";
import { Spinner } from "@/components/ui/spinner";
import { getMyRanchSubscription } from "@/features/subscriptions/api/my-ranch-api";
import { hasActivePaidPlan, type RanchSubscription } from "@/features/subscriptions/types";
import { PlanRequiredPage } from "@/features/subscriptions/pages/plan-required-page";
import { useAuth } from "@/features/auth/context/use-auth";

/**
 * Gatea el acceso al panel de usuario por plan de suscripción: solo entra
 * quien tiene un plan pago (no Free) en estado trial o active. No toca el
 * caso "usuario sin estancia" (idRanch null) — eso lo sigue manejando la
 * página que envuelve, sin cambios.
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

  // Sin estancia: no hay nada que consultar — lo resuelve la página envuelta
  // (RanchDashboardPage) con su propio mensaje, sin pasar por el gate.
  if (!idRanch) {
    return <>{children}</>;
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

  return <>{children}</>;
}
