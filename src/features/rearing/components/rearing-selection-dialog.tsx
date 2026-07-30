import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRightCircle } from "lucide-react";
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
import { registerRearingSelection } from "@/features/rearing/api/rearing-api";
import { rearingSelectionSchema, type RearingSelectionValues } from "@/features/rearing/schemas/rearing-selection-schema";
import { REARING_DESTINATION_LABELS, FATTENING_SYSTEM_TYPE_LABELS } from "@/features/rearing/types";
import { useAuth } from "@/features/auth/context/use-auth";
import { translateError } from "@/lib/error-messages";

interface RearingSelectionDialogProps {
  idRanch: number;
  animal: RanchAnimal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

const emptyValues: Partial<z.input<typeof rearingSelectionSchema>> = {
  destination: undefined,
  notes: "",
  eventDate: "",
};

export function RearingSelectionDialog({ idRanch, animal, open, onOpenChange, onCreated }: RearingSelectionDialogProps) {
  const { session } = useAuth();
  const [lots, setLots] = useState<RanchLot[]>([]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof rearingSelectionSchema>, unknown, RearingSelectionValues>({
    resolver: zodResolver(rearingSelectionSchema),
    defaultValues: emptyValues,
  });

  const destination = watch("destination");

  useEffect(() => {
    if (!open || !session) return;
    reset(emptyValues);
    getRanchLots(idRanch, session.accessToken)
      .then(setLots)
      .catch((error) => toast.error(translateError(error, "No se pudieron cargar los lotes.")));
  }, [open, session, idRanch, reset]);

  const fatteningLots = lots.filter((l) => l.lotType === "engorde");

  const onSubmit = async (values: RearingSelectionValues) => {
    if (!session || !animal) return;
    try {
      await registerRearingSelection(
        {
          idRanchAnimal: animal.id,
          destination: values.destination,
          idLotDest: values.destination === "fattening" ? values.idLotDest : undefined,
          systemType: values.destination === "fattening" ? values.systemType : undefined,
          weightAtSelection: values.weightAtSelection,
          bodyCondition: values.bodyCondition,
          geneticScore: values.geneticScore,
          notes: values.notes || undefined,
          eventDate: new Date(values.eventDate).toISOString(),
        },
        session.accessToken,
      );
      toast.success(`Destino registrado para ${animal.code}`);
      onCreated();
      onOpenChange(false);
    } catch (error) {
      toast.error(translateError(error, "No se pudo registrar el destino."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="flex-row items-center gap-3 space-y-0">
          <ModuleIcon icon={ArrowRightCircle} color="blue" size="sm" />
          <div>
            <DialogTitle>Seleccionar destino</DialogTitle>
            <DialogDescription>{animal ? `Animal ${animal.code} — decidí el próximo paso.` : ""}</DialogDescription>
          </div>
        </DialogHeader>

        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field data-invalid={!!errors.destination}>
              <FieldLabel htmlFor="destination">Destino</FieldLabel>
              <Controller
                control={control}
                name="destination"
                render={({ field }) => (
                  <Select
                    items={[
                      { label: "Elegí el destino", value: null },
                      ...Object.entries(REARING_DESTINATION_LABELS).map(([value, label]) => ({ label, value })),
                    ]}
                    value={field.value ?? null}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="destination" className="w-full" aria-invalid={!!errors.destination}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {Object.entries(REARING_DESTINATION_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[errors.destination]} />
            </Field>

            {destination === "sale" ? (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                Esta acción es irreversible: el animal pasa a Baja y no puede recibir más eventos.
              </p>
            ) : null}

            {destination === "fattening" ? (
              <div className="grid grid-cols-2 gap-4">
                <Field data-invalid={!!errors.idLotDest}>
                  <FieldLabel htmlFor="idLotDest">Lote de engorde</FieldLabel>
                  <Controller
                    control={control}
                    name="idLotDest"
                    render={({ field }) => (
                      <Select
                        items={[{ label: "Elegí el lote", value: null }, ...fatteningLots.map((l) => ({ label: l.name, value: l.id }))]}
                        value={field.value ?? null}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger id="idLotDest" className="w-full" aria-invalid={!!errors.idLotDest}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {fatteningLots.map((l) => (
                              <SelectItem key={l.id} value={l.id}>
                                {l.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldError errors={[errors.idLotDest]} />
                </Field>

                <Field data-invalid={!!errors.systemType}>
                  <FieldLabel htmlFor="systemType">Sistema</FieldLabel>
                  <Controller
                    control={control}
                    name="systemType"
                    render={({ field }) => (
                      <Select
                        items={[
                          { label: "Elegí el sistema", value: null },
                          ...Object.entries(FATTENING_SYSTEM_TYPE_LABELS).map(([value, label]) => ({ label, value })),
                        ]}
                        value={field.value ?? null}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger id="systemType" className="w-full" aria-invalid={!!errors.systemType}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {Object.entries(FATTENING_SYSTEM_TYPE_LABELS).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldError errors={[errors.systemType]} />
                </Field>
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-4">
              <Field data-invalid={!!errors.weightAtSelection}>
                <FieldLabel htmlFor="weightAtSelection">Peso (kg, opcional)</FieldLabel>
                <Input
                  id="weightAtSelection"
                  type="number"
                  step="0.01"
                  min="0"
                  aria-invalid={!!errors.weightAtSelection}
                  {...register("weightAtSelection")}
                />
                <FieldError errors={[errors.weightAtSelection]} />
              </Field>
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
            </div>

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
              Registrar destino
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
