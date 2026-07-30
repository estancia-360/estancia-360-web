import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pill } from "lucide-react";
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
import { registerTreatment } from "@/features/health/api/health-api";
import { treatmentSchema, type TreatmentValues } from "@/features/health/schemas/treatment-schema";
import type { RanchAnimal } from "@/features/animals/types";
import { useAuth } from "@/features/auth/context/use-auth";
import { translateError } from "@/lib/error-messages";

interface TreatmentDialogProps {
  animal: RanchAnimal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

const emptyValues: Partial<z.input<typeof treatmentSchema>> = {
  illness: "",
  medication: "",
  dose: "",
  durationDays: "",
  withdrawalDays: "",
  responsible: "",
  notes: "",
  eventDate: "",
};

export function TreatmentDialog({ animal, open, onOpenChange, onCreated }: TreatmentDialogProps) {
  const { session } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof treatmentSchema>, unknown, TreatmentValues>({
    resolver: zodResolver(treatmentSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (open) reset(emptyValues);
  }, [open, reset]);

  const onSubmit = async (values: TreatmentValues) => {
    if (!session || !animal) return;
    try {
      await registerTreatment(
        {
          idRanchAnimal: animal.id,
          illness: values.illness || undefined,
          medication: values.medication,
          dose: values.dose || undefined,
          durationDays: values.durationDays,
          withdrawalDays: values.withdrawalDays,
          responsible: values.responsible || undefined,
          notes: values.notes || undefined,
          eventDate: new Date(values.eventDate).toISOString(),
        },
        session.accessToken,
      );
      toast.success(`Tratamiento registrado para ${animal.code}`);
      onCreated();
      onOpenChange(false);
    } catch (error) {
      toast.error(translateError(error, "No se pudo registrar el tratamiento."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="flex-row items-center gap-3 space-y-0">
          <ModuleIcon icon={Pill} color="blue" size="sm" />
          <div>
            <DialogTitle>Registrar tratamiento</DialogTitle>
            <DialogDescription>{animal ? `Animal ${animal.code}` : ""}</DialogDescription>
          </div>
        </DialogHeader>

        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="illness">Enfermedad (opcional)</FieldLabel>
                <Input id="illness" {...register("illness")} />
              </Field>
              <Field data-invalid={!!errors.medication}>
                <FieldLabel htmlFor="medication">Medicamento</FieldLabel>
                <Input id="medication" aria-invalid={!!errors.medication} {...register("medication")} />
                <FieldError errors={[errors.medication]} />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="dose">Dosis (opcional)</FieldLabel>
                <Input id="dose" {...register("dose")} />
              </Field>
              <Field data-invalid={!!errors.eventDate}>
                <FieldLabel htmlFor="eventDate">Fecha</FieldLabel>
                <Input id="eventDate" type="date" aria-invalid={!!errors.eventDate} {...register("eventDate")} />
                <FieldError errors={[errors.eventDate]} />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field data-invalid={!!errors.durationDays}>
                <FieldLabel htmlFor="durationDays">Duración (días, opcional)</FieldLabel>
                <Input
                  id="durationDays"
                  type="number"
                  min={1}
                  aria-invalid={!!errors.durationDays}
                  {...register("durationDays")}
                />
                <FieldError errors={[errors.durationDays]} />
              </Field>
              <Field data-invalid={!!errors.withdrawalDays}>
                <FieldLabel htmlFor="withdrawalDays">Días de retiro (opcional)</FieldLabel>
                <Input
                  id="withdrawalDays"
                  type="number"
                  min={1}
                  aria-invalid={!!errors.withdrawalDays}
                  {...register("withdrawalDays")}
                />
                <FieldError errors={[errors.withdrawalDays]} />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="responsible">Responsable (opcional)</FieldLabel>
              <Input id="responsible" {...register("responsible")} />
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
              Registrar tratamiento
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
