import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Beef, TriangleAlert, ArrowRight, Gauge } from "lucide-react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatTile } from "@/components/layout/stat-tile";
import { SubscriptionStatusBadge } from "@/features/admin/components/subscription-status-badge";
import { getDashboardStats } from "@/features/dashboard/api/dashboard-api";
import type { DashboardStats } from "@/features/dashboard/types";
import { useAuth } from "@/features/auth/context/use-auth";
import { useRanchSubscription } from "@/features/subscriptions/context/ranch-subscription-context";
import { translateError } from "@/lib/error-messages";

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(`${value}T00:00:00`).toLocaleDateString("es-BO", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function RanchOverviewPage() {
  const subscription = useRanchSubscription();
  const { session } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    getDashboardStats(subscription.ranch.id, session.accessToken)
      .then((res) => setStats(res.dashboard))
      .catch((error) => toast.error(translateError(error, "No se pudieron cargar las estadísticas.")))
      .finally(() => setIsLoading(false));
  }, [session, subscription.ranch.id]);

  const alertsTotal = stats ? stats.alerts.quarantineCount + stats.alerts.activeWithdrawalCount + stats.alerts.pendingSalesCount : 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-brand-blue">{subscription.ranch.name}</h1>
        <p className="text-sm text-muted-foreground">Resumen de tu estancia.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:max-w-2xl">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : stats ? (
        <div className="flex flex-col gap-3 sm:max-w-2xl">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
            <StatTile icon={Beef} color="green" label="Animales activos" value={stats.herd.totalActive} delay={0} />
            <StatTile icon={TriangleAlert} color="orange" label="Alertas operativas" value={alertsTotal} delay={60} />
          </div>
          <Button variant="outline" size="sm" className="self-start" onClick={() => navigate("/dashboard/estadisticas")}>
            <Gauge data-icon="inline-start" />
            Ver dashboard completo
            <ArrowRight data-icon="inline-end" />
          </Button>
        </div>
      ) : null}

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
