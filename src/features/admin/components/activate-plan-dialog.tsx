import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { activatePlan, getPlans } from "@/features/admin/api/subscriptions-api";
import type { BillingCycle, RanchSubscription, SubscriptionPlan } from "@/features/admin/types/subscriptions";
import { useAuth } from "@/features/auth/context/use-auth";
import { ApiError } from "@/lib/api-client";

interface ActivatePlanDialogProps {
  subscription: RanchSubscription | null;
  onOpenChange: (open: boolean) => void;
  onActivated: (subscription: RanchSubscription) => void;
}

const FREE_PLAN_ID = 1;

const billingCycleItems: Array<{ label: string; value: BillingCycle | null }> = [
  { label: "Seleccioná un ciclo", value: null },
  { label: "Mensual", value: "monthly" },
  { label: "Anual", value: "annual" },
];

export function ActivatePlanDialog({ subscription, onOpenChange, onActivated }: ActivatePlanDialogProps) {
  const { session } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [billingCycle, setBillingCycle] = useState<BillingCycle | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadedForId, setLoadedForId] = useState<number | null>(null);

  const isOpen = subscription !== null;

  useEffect(() => {
    if (!isOpen) return;
    getPlans()
      .then(({ plans }) => setPlans(plans.filter((plan) => plan.isActive)))
      .catch(() => toast.error("No se pudieron cargar los planes."));
  }, [isOpen]);

  // Reinicializar la selección cuando cambia la suscripción objetivo (nuevo ranch
  // abierto en el diálogo) — ajuste de estado durante el render, no un efecto,
  // porque no sincroniza con nada externo, solo resetea al cambiar el prop.
  if (subscription && subscription.id !== loadedForId) {
    setLoadedForId(subscription.id);
    setSelectedPlanId(subscription.idPlan);
    setBillingCycle(subscription.billingCycle);
  }

  const planItems = [{ label: "Seleccioná un plan", value: null }, ...plans.map((plan) => ({ label: plan.name, value: plan.id }))];
  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId);
  const requiresBillingCycle = selectedPlan ? selectedPlan.id !== FREE_PLAN_ID : false;

  const handleSubmit = async () => {
    if (!subscription || !session || !selectedPlanId) return;
    if (requiresBillingCycle && !billingCycle) {
      toast.error("Este plan requiere elegir un ciclo de facturación.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await activatePlan(
        subscription.idRanch,
        { idPlan: selectedPlanId, billingCycle: requiresBillingCycle ? billingCycle! : undefined },
        session.accessToken,
      );
      toast.success(`Plan actualizado para ${subscription.ranch.name}`);
      onActivated(result.subscription);
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "No se pudo activar el plan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Activar / cambiar plan</DialogTitle>
          <DialogDescription>{subscription?.ranch.name}</DialogDescription>
        </DialogHeader>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="plan">Plan</FieldLabel>
            <Select
              items={planItems}
              value={selectedPlanId}
              onValueChange={(value) => {
                setSelectedPlanId(value as number);
                setBillingCycle(null);
              }}
            >
              <SelectTrigger id="plan" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>

          {requiresBillingCycle ? (
            <Field>
              <FieldLabel htmlFor="billingCycle">Ciclo de facturación</FieldLabel>
              <Select items={billingCycleItems} value={billingCycle} onValueChange={(value) => setBillingCycle(value as BillingCycle)}>
                <SelectTrigger id="billingCycle" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="monthly">Mensual</SelectItem>
                    <SelectItem value="annual">Anual</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FieldDescription>Obligatorio para cualquier plan pago — define cómo se calcula el MRR.</FieldDescription>
            </Field>
          ) : null}
        </FieldGroup>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
          <Button onClick={handleSubmit} disabled={isSubmitting || !selectedPlanId}>
            {isSubmitting ? <Spinner data-icon="inline-start" /> : null}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
