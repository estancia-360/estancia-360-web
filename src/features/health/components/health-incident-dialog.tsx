import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Stethoscope } from "lucide-react";
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
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { ModuleIcon } from "@/components/layout/module-icon";
import { registerHealthIncident } from "@/features/health/api/health-api";
import { healthIncidentSchema, type HealthIncidentValues } from "@/features/health/schemas/health-incident-schema";
import { INCIDENT_TYPE_LABELS } from "@/features/health/types";
import type { RanchAnimal } from "@/features/animals/types";
import { useAuth } from "@/features/auth/context/use-auth";
import { translateError } from "@/lib/error-messages";

interface HealthIncidentDialogProps {
  animal: RanchAnimal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

const emptyValues: Partial<z.input<typeof healthIncidentSchema>> = {
  incidentType: undefined,
  description: "",
  notes: "",
  eventDate: "",
};

export function HealthIncidentDialog({ animal, open, onOpenChange, onCreated }: HealthIncidentDialogProps) {
  const { session } = useAuth();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof healthIncidentSchema>, unknown, HealthIncidentValues>({
    resolver: zodResolver(healthIncidentSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (open) reset(emptyValues);
  }, [open, reset]);

  const onSubmit = async (values: HealthIncidentValues) => {
    if (!session || !animal) return;
    try {
      await registerHealthIncident(
        {
          idRanchAnimal: animal.id,
          incidentType: values.incidentType,
          description: values.description || undefined,
          notes: values.notes || undefined,
          eventDate: new Date(values.eventDate).toISOString(),
        },
        session.accessToken,
      );
      toast.success(`Incidente registrado para ${animal.code}`);
      onCreated();
      onOpenChange(false);
    } catch (error) {
      toast.error(translateError(error, "No se pudo registrar el incidente."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="flex-row items-center gap-3 space-y-0">
          <ModuleIcon icon={Stethoscope} color="blue" size="sm" />
          <div>
            <DialogTitle>Registrar incidente sanitario</DialogTitle>
            <DialogDescription>{animal ? `Animal ${animal.code}` : ""}</DialogDescription>
          </div>
        </DialogHeader>

        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field data-invalid={!!errors.incidentType}>
              <FieldLabel htmlFor="incidentType">Tipo</FieldLabel>
              <Controller
                control={control}
                name="incidentType"
                render={({ field }) => (
                  <Select
                    items={[
                      { label: "Elegí el tipo", value: null },
                      ...Object.entries(INCIDENT_TYPE_LABELS).map(([value, label]) => ({ label, value })),
                    ]}
                    value={field.value ?? null}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="incidentType" className="w-full" aria-invalid={!!errors.incidentType}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {Object.entries(INCIDENT_TYPE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[errors.incidentType]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="description">Descripción (opcional)</FieldLabel>
              <Input id="description" {...register("description")} />
            </Field>

            <Field data-invalid={!!errors.eventDate}>
              <FieldLabel htmlFor="eventDate">Fecha</FieldLabel>
              <Input id="eventDate" type="date" aria-invalid={!!errors.eventDate} {...register("eventDate")} />
              <FieldError errors={[errors.eventDate]} />
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
              Registrar incidente
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
