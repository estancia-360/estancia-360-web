import { useEffect, useState, useCallback } from "react";
import { MoreHorizontal, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardAction } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { SubscriptionStatusBadge } from "@/features/admin/components/subscription-status-badge";
import { ActivatePlanDialog } from "@/features/admin/components/activate-plan-dialog";
import { RegisterPaymentDialog } from "@/features/admin/components/register-payment-dialog";
import { CancelSubscriptionDialog } from "@/features/admin/components/cancel-subscription-dialog";
import { getAllSubscriptions } from "@/features/admin/api/subscriptions-api";
import type { RanchSubscription } from "@/features/admin/types/subscriptions";
import { useAuth } from "@/features/auth/context/use-auth";
import { translateError } from "@/lib/error-messages";

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(`${value}T00:00:00`).toLocaleDateString("es-BO", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function AdminSubscriptionsPage() {
  const { session } = useAuth();
  const [subscriptions, setSubscriptions] = useState<RanchSubscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activateTarget, setActivateTarget] = useState<RanchSubscription | null>(null);
  const [paymentTarget, setPaymentTarget] = useState<RanchSubscription | null>(null);
  const [cancelTarget, setCancelTarget] = useState<RanchSubscription | null>(null);

  const loadSubscriptions = useCallback(() => {
    if (!session) return;
    getAllSubscriptions(session.accessToken)
      .then(({ subscriptions }) => setSubscriptions(subscriptions))
      .catch((error) => {
        toast.error(translateError(error, "No se pudieron cargar las suscripciones."));
      })
      .finally(() => setIsLoading(false));
  }, [session]);

  useEffect(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

  const handleRefresh = () => {
    setIsLoading(true);
    loadSubscriptions();
  };

  const replaceSubscription = (updated: RanchSubscription) => {
    setSubscriptions((prev) => prev.map((sub) => (sub.id === updated.id ? updated : sub)));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-brand-blue">Suscripciones</h1>
          <p className="text-sm text-muted-foreground">Gestión de planes y pagos por estancia.</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCcw data-icon="inline-start" />
          Actualizar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todas las estancias</CardTitle>
          <CardDescription>
            {subscriptions.length} {subscriptions.length === 1 ? "suscripción" : "suscripciones"}
          </CardDescription>
          <CardAction />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : subscriptions.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>No hay suscripciones todavía</EmptyTitle>
                <EmptyDescription>Las estancias nacen automáticamente en Free al crearse.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estancia</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Ciclo</TableHead>
                  <TableHead>Prueba hasta</TableHead>
                  <TableHead>Vence</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell className="font-medium">{subscription.ranch.name}</TableCell>
                    <TableCell>{subscription.plan.name}</TableCell>
                    <TableCell>
                      <SubscriptionStatusBadge status={subscription.effectiveStatus} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {subscription.billingCycle === "annual" ? "Anual" : subscription.billingCycle === "monthly" ? "Mensual" : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(subscription.trialEndsAt)}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(subscription.currentPeriodEnd)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
                          <MoreHorizontal />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setActivateTarget(subscription)}>
                            Activar / cambiar plan
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setPaymentTarget(subscription)}>Registrar pago</DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            disabled={subscription.effectiveStatus === "cancelled"}
                            onClick={() => setCancelTarget(subscription)}
                          >
                            Cancelar suscripción
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ActivatePlanDialog
        subscription={activateTarget}
        onOpenChange={(open) => !open && setActivateTarget(null)}
        onActivated={replaceSubscription}
      />
      <RegisterPaymentDialog
        subscription={paymentTarget}
        onOpenChange={(open) => !open && setPaymentTarget(null)}
        onRegistered={replaceSubscription}
      />
      <CancelSubscriptionDialog
        subscription={cancelTarget}
        onOpenChange={(open) => !open && setCancelTarget(null)}
        onCancelled={replaceSubscription}
      />
    </div>
  );
}
