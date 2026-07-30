import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Wheat } from "lucide-react";
import { toast } from "sonner";
import type { z } from "zod";
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
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { ModuleIcon } from "@/components/layout/module-icon";
import type { RanchLot } from "@/features/animals/types";
import { registerFeedRecord } from "@/features/fattening/api/fattening-api";
import { feedRecordSchema, type FeedRecordValues } from "@/features/fattening/schemas/feed-record-schema";
import { useAuth } from "@/features/auth/context/use-auth";
import { translateError } from "@/lib/error-messages";

interface FeedRecordDialogProps {
  lot: RanchLot | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

const emptyValues: Partial<z.input<typeof feedRecordSchema>> = { unit: "kg", notes: "", feedDate: "" };

export function FeedRecordDialog({ lot, open, onOpenChange, onCreated }: FeedRecordDialogProps) {
  const { session } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof feedRecordSchema>, unknown, FeedRecordValues>({
    resolver: zodResolver(feedRecordSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (open) reset(emptyValues);
  }, [open, reset]);

  const onSubmit = async (values: FeedRecordValues) => {
    if (!session || !lot) return;
    try {
      await registerFeedRecord(
        {
          idLot: lot.id,
          feedDate: values.feedDate,
          feedType: values.feedType,
          quantity: values.quantity,
          unit: values.unit || undefined,
          cost: values.cost,
          notes: values.notes || undefined,
        },
        session.accessToken,
      );
      toast.success(`Alimentación registrada para ${lot.name}`);
      onCreated();
      onOpenChange(false);
    } catch (error) {
      toast.error(translateError(error, "No se pudo registrar la alimentación."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="flex-row items-center gap-3 space-y-0">
          <ModuleIcon icon={Wheat} color="green" size="sm" />
          <div>
            <DialogTitle>Registrar alimentación</DialogTitle>
            <DialogDescription>{lot ? `Lote ${lot.name}` : ""}</DialogDescription>
          </div>
        </DialogHeader>

        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <div className="grid grid-cols-2 gap-4">
              <Field data-invalid={!!errors.feedType}>
                <FieldLabel htmlFor="feedType">Tipo de alimento</FieldLabel>
                <Input id="feedType" placeholder="Silo, ración, pasto..." aria-invalid={!!errors.feedType} {...register("feedType")} />
                <FieldError errors={[errors.feedType]} />
              </Field>
              <Field data-invalid={!!errors.feedDate}>
                <FieldLabel htmlFor="feedDate">Fecha</FieldLabel>
                <Input id="feedDate" type="date" aria-invalid={!!errors.feedDate} {...register("feedDate")} />
                <FieldError errors={[errors.feedDate]} />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field data-invalid={!!errors.quantity}>
                <FieldLabel htmlFor="quantity">Cantidad (opcional)</FieldLabel>
                <Input id="quantity" type="number" step="0.01" min="0" aria-invalid={!!errors.quantity} {...register("quantity")} />
                <FieldError errors={[errors.quantity]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="unit">Unidad (opcional)</FieldLabel>
                <Input id="unit" placeholder="kg" {...register("unit")} />
              </Field>
            </div>

            <Field data-invalid={!!errors.cost}>
              <FieldLabel htmlFor="cost">Costo (opcional)</FieldLabel>
              <Input id="cost" type="number" step="0.01" min="0" aria-invalid={!!errors.cost} {...register("cost")} />
              <FieldError errors={[errors.cost]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="notes">Notas (opcional)</FieldLabel>
              <Input id="notes" {...register("notes")} />
            </Field>
          </FieldGroup>

          <DialogFooter className="mt-6">
            <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Spinner data-icon="inline-start" /> : null}
              Registrar alimentación
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
