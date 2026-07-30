import { useState } from "react";
import { Check, X, Ban, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { ModuleIcon } from "@/components/layout/module-icon";
import { confirmMovementAnimal, cancelMovement } from "@/features/movements/api/movements-api";
import { MOVEMENT_ANIMAL_STATUS_LABELS, MOVEMENT_TYPE_LABELS, type Movement } from "@/features/movements/types";
import { useAuth } from "@/features/auth/context/use-auth";
import { translateError } from "@/lib/error-messages";

interface MovementDetailDialogProps {
  movement: Movement | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
}

const ANIMAL_STATUS_STYLE: Record<string, string> = {
  pending: "bg-brand-orange/15 text-brand-orange-dark",
  accepted: "bg-brand-green/10 text-brand-green",
  rejected: "bg-destructive/10 text-destructive",
  confirmed: "bg-brand-green/10 text-brand-green",
};

export function MovementDetailDialog({ movement, open, onOpenChange, onUpdated }: MovementDetailDialogProps) {
  const { session } = useAuth();
  const [busyId, setBusyId] = useState<number | null>(null);
  const [cancelling, setCancelling] = useState(false);

  if (!movement) return null;

  const handleConfirm = async (idMovementAnimal: number, status: "accepted" | "rejected") => {
    if (!session) return;
    setBusyId(idMovementAnimal);
    try {
      await confirmMovementAnimal(idMovementAnimal, status, session.accessToken);
      toast.success(status === "accepted" ? "Animal confirmado" : "Animal rechazado");
      onUpdated();
    } catch (error) {
      toast.error(translateError(error, "No se pudo actualizar el animal."));
    } finally {
      setBusyId(null);
    }
  };

  const handleCancel = async () => {
    if (!session) return;
    setCancelling(true);
    try {
      await cancelMovement(movement.id, session.accessToken);
      toast.success("Movimiento cancelado");
      onUpdated();
      onOpenChange(false);
    } catch (error) {
      toast.error(translateError(error, "No se pudo cancelar el movimiento."));
    } finally {
      setCancelling(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="flex-row items-center gap-3 space-y-0">
          <ModuleIcon icon={ClipboardList} color="orange" size="sm" />
          <div>
            <DialogTitle>{MOVEMENT_TYPE_LABELS[movement.movementType]}</DialogTitle>
            <DialogDescription>{movement.counterpartName ?? movement.originName ?? "Detalle del movimiento"}</DialogDescription>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          {movement.animals.map((ma) => (
            <div key={ma.id} className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 ring-1 ring-foreground/10">
              <div className="flex items-center gap-2">
                <span className="font-medium">{ma.animal.code}</span>
                <Badge className={ANIMAL_STATUS_STYLE[ma.status]}>{MOVEMENT_ANIMAL_STATUS_LABELS[ma.status]}</Badge>
              </div>
              {movement.movementType === "sale" && ma.status === "pending" ? (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busyId === ma.id}
                    onClick={() => handleConfirm(ma.id, "accepted")}
                  >
                    {busyId === ma.id ? <Spinner data-icon="inline-start" /> : <Check data-icon="inline-start" />}
                    Aceptar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busyId === ma.id}
                    onClick={() => handleConfirm(ma.id, "rejected")}
                  >
                    <X data-icon="inline-start" />
                    Rechazar
                  </Button>
                </div>
              ) : null}
            </div>
          ))}
        </div>

        {movement.status === "pending" ? (
          <DialogFooter className="mt-4">
            <Button variant="outline" className="text-destructive" disabled={cancelling} onClick={handleCancel}>
              {cancelling ? <Spinner data-icon="inline-start" /> : <Ban data-icon="inline-start" />}
              Cancelar movimiento
            </Button>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
