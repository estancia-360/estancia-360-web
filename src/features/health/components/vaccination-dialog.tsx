import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Syringe } from "lucide-react";
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
import { registerVaccination } from "@/features/health/api/health-api";
import { vaccinationSchema, type VaccinationValues } from "@/features/health/schemas/vaccination-schema";
import type { RanchAnimal } from "@/features/animals/types";
import { useAuth } from "@/features/auth/context/use-auth";
import { translateError } from "@/lib/error-messages";

interface VaccinationDialogProps {
  animal: RanchAnimal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

const emptyValues: Partial<z.input<typeof vaccinationSchema>> = { vaccineName: "", dose: "", responsible: "", notes: "", eventDate: "" };

export function VaccinationDialog({ animal, open, onOpenChange, onCreated }: VaccinationDialogProps) {
  const { session } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof vaccinationSchema>, unknown, VaccinationValues>({
    resolver: zodResolver(vaccinationSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (open) reset(emptyValues);
  }, [open, reset]);

  const onSubmit = async (values: VaccinationValues) => {
    if (!session || !animal) return;
    try {
      await registerVaccination(
        {
          idRanchAnimal: animal.id,
          vaccineName: values.vaccineName,
          dose: values.dose || undefined,
          responsible: values.responsible || undefined,
          notes: values.notes || undefined,
          eventDate: new Date(values.eventDate).toISOString(),
        },
        session.accessToken,
      );
      toast.success(`Vacunación registrada para ${animal.code}`);
      onCreated();
      onOpenChange(false);
    } catch (error) {
      toast.error(translateError(error, "No se pudo registrar la vacunación."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="flex-row items-center gap-3 space-y-0">
          <ModuleIcon icon={Syringe} color="blue" size="sm" />
          <div>
            <DialogTitle>Registrar vacunación</DialogTitle>
            <DialogDescription>{animal ? `Animal ${animal.code}` : ""}</DialogDescription>
          </div>
        </DialogHeader>

        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <div className="grid grid-cols-2 gap-4">
              <Field data-invalid={!!errors.vaccineName}>
                <FieldLabel htmlFor="vaccineName">Vacuna</FieldLabel>
                <Input id="vaccineName" placeholder="Aftosa" aria-invalid={!!errors.vaccineName} {...register("vaccineName")} />
                <FieldError errors={[errors.vaccineName]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="dose">Dosis (opcional)</FieldLabel>
                <Input id="dose" placeholder="5ml" {...register("dose")} />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="responsible">Responsable (opcional)</FieldLabel>
                <Input id="responsible" placeholder="Dr. Pérez" {...register("responsible")} />
              </Field>
              <Field data-invalid={!!errors.eventDate}>
                <FieldLabel htmlFor="eventDate">Fecha</FieldLabel>
                <Input id="eventDate" type="date" aria-invalid={!!errors.eventDate} {...register("eventDate")} />
                <FieldError errors={[errors.eventDate]} />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="notes">Notas (opcional)</FieldLabel>
              <Input id="notes" {...register("notes")} />
            </Field>
          </FieldGroup>

          <DialogFooter className="mt-6">
            <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Spinner data-icon="inline-start" /> : null}
              Registrar vacunación
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
