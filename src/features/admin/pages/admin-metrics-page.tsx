import { useEffect, useState } from "react";
import { DollarSign, Users, PieChart } from "lucide-react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { getMetrics } from "@/features/admin/api/subscriptions-api";
import type { SubscriptionMetrics } from "@/features/admin/types/subscriptions";
import { useAuth } from "@/features/auth/context/use-auth";
import { translateError } from "@/lib/error-messages";

const currencyFormatter = new Intl.NumberFormat("es-BO", {
  style: "currency",
  currency: "BOB",
  minimumFractionDigits: 2,
});

export function AdminMetricsPage() {
  const { session } = useAuth();
  const [metrics, setMetrics] = useState<SubscriptionMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;

    getMetrics(session.accessToken)
      .then((result) => {
        if (!cancelled) setMetrics(result);
      })
      .catch((error) => {
        toast.error(translateError(error, "No se pudieron cargar las métricas."));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [session]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-brand-blue">Métricas de suscripciones</h1>
        <p className="text-sm text-muted-foreground">
          MRR y clientes activos — solo suscripciones en estado <Badge variant="secondary">active</Badge>, sin
          contar trials ni el plan Free.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription className="flex items-center gap-1.5">
              <DollarSign className="size-3.5" />
              MRR
            </CardDescription>
            <CardTitle className="font-heading text-3xl">
              {isLoading || !metrics ? <Skeleton className="h-9 w-32" /> : currencyFormatter.format(metrics.mrr)}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription className="flex items-center gap-1.5">
              <Users className="size-3.5" />
              Clientes activos
            </CardDescription>
            <CardTitle className="font-heading text-3xl">
              {isLoading || !metrics ? <Skeleton className="h-9 w-16" /> : metrics.activeClients}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription className="flex items-center gap-1.5">
              <PieChart className="size-3.5" />
              Planes pagos activos
            </CardDescription>
            <CardTitle className="font-heading text-3xl">
              {isLoading || !metrics ? <Skeleton className="h-9 w-16" /> : metrics.byPlan.length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Distribución por plan</CardTitle>
          <CardDescription>Cantidad de estancias activas (pagando) en cada plan pago.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : !metrics || metrics.byPlan.length === 0 ? (
            <p className="text-sm text-muted-foreground">Todavía no hay ninguna suscripción paga activa.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {metrics.byPlan.map((plan) => (
                <div key={plan.idPlan} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                  <span className="text-sm font-medium">{plan.name}</span>
                  <Badge variant="secondary">{plan.count} estancia{plan.count === 1 ? "" : "s"}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
