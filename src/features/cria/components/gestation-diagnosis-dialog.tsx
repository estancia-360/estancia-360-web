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
import { registerGestationDiagnosis } from "@/features/cria/api/cria-api";
import { gestationDiagnosisSchema, type GestationDiagnosisValues } from "@/features/cria/schemas/gestation-diagnosis-schema";
import { GESTATION_METHOD_LABELS, GESTATION_RESULT_LABELS, type BreedingService } from "@/features/cria/types";
import { useAuth } from "@/features/auth/context/use-auth";
import { translateError } from "@/lib/error-messages";

interface GestationDiagnosisDialogProps {
  service: BreedingService | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

const emptyValues: Partial<z.input<typeof gestationDiagnosisSchema>> = {
  method: undefined,
  result: undefined,
  estimatedBirth: "",
  veterinarian: "",
  notes: "",
  eventDate: "",
};

export function GestationDiagnosisDialog({ service, open, onOpenChange, onCreated }: GestationDiagnosisDialogProps) {
  const { session } = useAuth();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof gestationDiagnosisSchema>, unknown, GestationDiagnosisValues>({
    resolver: zodResolver(gestationDiagnosisSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (open) reset(emptyValues);
  }, [open, reset]);

  const onSubmit = async (values: GestationDiagnosisValues) => {
    if (!session || !service) return;
    try {
      await registerGestationDiagnosis(
        {
          idRanchAnimal: service.event.idRanchAnimal,
          idService: service.id,
          method: values.method,
          result: values.result,
          gestationDays: values.gestationDays,
          estimatedBirth: values.estimatedBirth || undefined,
          veterinarian: values.veterinarian || undefined,
          notes: values.notes || undefined,
          eventDate: new Date(values.eventDate).toISOString(),
        },
        session.accessToken,
      );
      toast.success(`Diagnóstico registrado para ${service.event.animal.code}`);
      onCreated();
      onOpenChange(false);
    } catch (error) {
      toast.error(translateError(error, "No se pudo registrar el diagnóstico."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="flex-row items-center gap-3 space-y-0">
          <ModuleIcon icon={Stethoscope} color="orange" size="sm" />
          <div>
            <DialogTitle>Diagnóstico de gestación</DialogTitle>
            <DialogDescription>{service ? `Animal ${service.event.animal.code}` : ""}</DialogDescription>
          </div>
        </DialogHeader>

        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <div className="grid grid-cols-2 gap-4">
              <Field data-invalid={!!errors.method}>
                <FieldLabel htmlFor="method">Método</FieldLabel>
                <Controller
                  control={control}
                  name="method"
                  render={({ field }) => (
                    <Select
                      items={[
                        { label: "Elegí el método", value: null },
                        ...Object.entries(GESTATION_METHOD_LABELS).map(([value, label]) => ({ label, value })),
                      ]}
                      value={field.value ?? null}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger id="method" className="w-full" aria-invalid={!!errors.method}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {Object.entries(GESTATION_METHOD_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.method]} />
              </Field>

              <Field data-invalid={!!errors.result}>
                <FieldLabel htmlFor="result">Resultado</FieldLabel>
                <Controller
                  control={control}
                  name="result"
                  render={({ field }) => (
                    <Select
                      items={[
                        { label: "Elegí el resultado", value: null },
                        ...Object.entries(GESTATION_RESULT_LABELS).map(([value, label]) => ({ label, value })),
                      ]}
                      value={field.value ?? null}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger id="result" className="w-full" aria-invalid={!!errors.result}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {Object.entries(GESTATION_RESULT_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.result]} />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field data-invalid={!!errors.gestationDays}>
                <FieldLabel htmlFor="gestationDays">Días de gestación (opcional)</FieldLabel>
                <Input id="gestationDays" type="number" min="1" max="300" aria-invalid={!!errors.gestationDays} {...register("gestationDays")} />
                <FieldError errors={[errors.gestationDays]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="estimatedBirth">Fecha estimada de parto (opcional)</FieldLabel>
                <Input id="estimatedBirth" type="date" {...register("estimatedBirth")} />
              </Field>
            </div>

            <Field data-invalid={!!errors.eventDate}>
              <FieldLabel htmlFor="eventDate">Fecha del diagnóstico</FieldLabel>
              <Input id="eventDate" type="date" aria-invalid={!!errors.eventDate} {...register("eventDate")} />
              <FieldError errors={[errors.eventDate]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="veterinarian">Veterinario (opcional)</FieldLabel>
              <Input id="veterinarian" {...register("veterinarian")} />
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
              Registrar diagnóstico
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
