import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { cancelSubscription } from "@/features/admin/api/subscriptions-api";
import type { RanchSubscription } from "@/features/admin/types/subscriptions";
import { useAuth } from "@/features/auth/context/use-auth";
import { ApiError } from "@/lib/api-client";

interface CancelSubscriptionDialogProps {
  subscription: RanchSubscription | null;
  onOpenChange: (open: boolean) => void;
  onCancelled: (subscription: RanchSubscription) => void;
}

export function CancelSubscriptionDialog({ subscription, onOpenChange, onCancelled }: CancelSubscriptionDialogProps) {
  const { session } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!subscription || !session) return;
    setIsSubmitting(true);
    try {
      const result = await cancelSubscription(subscription.idRanch, session.accessToken);
      toast.success(`Suscripción de ${subscription.ranch.name} cancelada`);
      onCancelled(result.subscription);
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "No se pudo cancelar la suscripción.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={subscription !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Cancelar la suscripción de {subscription?.ranch.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            La estancia va a caer al límite de capacidad del plan Free ({subscription?.plan.name !== "Free" ? "esto reduce" : "sin cambios en"}{" "}
            cuántos animales nuevos puede registrar) hasta que se reactive un plan. No borra ningún dato existente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Volver</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={isSubmitting} className="bg-destructive text-white hover:bg-destructive/90">
            Cancelar suscripción
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
