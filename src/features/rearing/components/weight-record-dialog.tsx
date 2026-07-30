import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Scale } from "lucide-react";
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
import { getRanchLots } from "@/features/animals/api/animals-api";
import type { RanchAnimal, RanchLot } from "@/features/animals/types";
import { registerWeightRecord } from "@/features/rearing/api/rearing-api";
import { weightRecordSchema, type WeightRecordValues } from "@/features/rearing/schemas/weight-record-schema";
import { WEIGHT_TYPE_LABELS } from "@/features/rearing/types";
import { useAuth } from "@/features/auth/context/use-auth";
import { translateError } from "@/lib/error-messages";

interface WeightRecordDialogProps {
  idRanch: number;
  animal: RanchAnimal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

const emptyValues: Partial<z.input<typeof weightRecordSchema>> = {
  weightType: undefined,
  notes: "",
  eventDate: "",
};

export function WeightRecordDialog({ idRanch, animal, open, onOpenChange, onCreated }: WeightRecordDialogProps) {
  const { session } = useAuth();
  const [lots, setLots] = useState<RanchLot[]>([]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof weightRecordSchema>, unknown, WeightRecordValues>({
    resolver: zodResolver(weightRecordSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!open || !session || !animal) return;
    reset({ ...emptyValues, idLot: animal.idLot ?? undefined });
    getRanchLots(idRanch, session.accessToken)
      .then(setLots)
      .catch((error) => toast.error(translateError(error, "No se pudieron cargar los lotes.")));
  }, [open, session, animal, idRanch, reset]);

  const onSubmit = async (values: WeightRecordValues) => {
    if (!session || !animal) return;
    try {
      await registerWeightRecord(
        {
          idRanchAnimal: animal.id,
          idLot: values.idLot,
          weight: values.weight,
          weightType: values.weightType,
          bodyCondition: values.bodyCondition,
          ageDays: values.ageDays,
          notes: values.notes || undefined,
          eventDate: new Date(values.eventDate).toISOString(),
        },
        session.accessToken,
      );
      toast.success(`Pesaje registrado para ${animal.code}`);
      onCreated();
      onOpenChange(false);
    } catch (error) {
      toast.error(translateError(error, "No se pudo registrar el pesaje."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="flex-row items-center gap-3 space-y-0">
          <ModuleIcon icon={Scale} color="blue" size="sm" />
          <div>
            <DialogTitle>Registrar pesaje</DialogTitle>
            <DialogDescription>{animal ? `Animal ${animal.code}` : ""}</DialogDescription>
          </div>
        </DialogHeader>

        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <div className="grid grid-cols-2 gap-4">
              <Field data-invalid={!!errors.weight}>
                <FieldLabel htmlFor="weight">Peso (kg)</FieldLabel>
                <Input id="weight" type="number" step="0.01" min="0" aria-invalid={!!errors.weight} {...register("weight")} />
                <FieldError errors={[errors.weight]} />
              </Field>

              <Field data-invalid={!!errors.weightType}>
                <FieldLabel htmlFor="weightType">Cómo se tomó</FieldLabel>
                <Controller
                  control={control}
                  name="weightType"
                  render={({ field }) => (
                    <Select
                      items={[
                        { label: "Elegí una opción", value: null },
                        ...Object.entries(WEIGHT_TYPE_LABELS).map(([value, label]) => ({ label, value })),
                      ]}
                      value={field.value ?? null}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger id="weightType" className="w-full" aria-invalid={!!errors.weightType}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {Object.entries(WEIGHT_TYPE_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.weightType]} />
              </Field>
            </div>

            <Field data-invalid={!!errors.idLot}>
              <FieldLabel htmlFor="idLot">Lote</FieldLabel>
              <Controller
                control={control}
                name="idLot"
                render={({ field }) => (
                  <Select
                    items={[{ label: "Elegí el lote", value: null }, ...lots.map((l) => ({ label: l.name, value: l.id }))]}
                    value={field.value ?? null}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="idLot" className="w-full" aria-invalid={!!errors.idLot}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {lots.map((l) => (
                          <SelectItem key={l.id} value={l.id}>
                            {l.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[errors.idLot]} />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field data-invalid={!!errors.bodyCondition}>
                <FieldLabel htmlFor="bodyCondition">Condición corporal (1-5, opcional)</FieldLabel>
                <Input
                  id="bodyCondition"
                  type="number"
                  min="1"
                  max="5"
                  aria-invalid={!!errors.bodyCondition}
                  {...register("bodyCondition")}
                />
                <FieldError errors={[errors.bodyCondition]} />
              </Field>
              <Field data-invalid={!!errors.ageDays}>
                <FieldLabel htmlFor="ageDays">Edad en días (opcional)</FieldLabel>
                <Input id="ageDays" type="number" min="1" aria-invalid={!!errors.ageDays} {...register("ageDays")} />
                <FieldError errors={[errors.ageDays]} />
              </Field>
            </div>

            <Field data-invalid={!!errors.eventDate}>
              <FieldLabel htmlFor="eventDate">Fecha del pesaje</FieldLabel>
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
              Registrar pesaje
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
