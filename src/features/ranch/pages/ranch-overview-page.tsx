import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { SubscriptionStatusBadge } from "@/features/admin/components/subscription-status-badge";
import { useRanchSubscription } from "@/features/subscriptions/context/ranch-subscription-context";

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(`${value}T00:00:00`).toLocaleDateString("es-BO", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/**
 * Base del panel de estancia — muestra lo único que ya hay disponible hoy
 * (datos reales de la suscripción). Los KPIs de producción llegan en la
 * próxima fase, uno por módulo, siguiendo el mismo orden que el sidebar.
 */
export function RanchOverviewPage() {
  const subscription = useRanchSubscription();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-brand-blue">{subscription.ranch.name}</h1>
        <p className="text-sm text-muted-foreground">Resumen de tu estancia.</p>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Tu plan</CardTitle>
          <CardDescription>Estado de la suscripción de esta estancia.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Plan</span>
            <span className="font-medium">{subscription.plan.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Estado</span>
            <SubscriptionStatusBadge status={subscription.effectiveStatus} />
          </div>
          {subscription.trialEndsAt ? (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Prueba hasta</span>
              <span className="font-medium">{formatDate(subscription.trialEndsAt)}</span>
            </div>
          ) : null}
          {subscription.currentPeriodEnd ? (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Vence</span>
              <span className="font-medium">{formatDate(subscription.currentPeriodEnd)}</span>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
