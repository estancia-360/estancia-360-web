import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UtensilsCrossed } from "lucide-react";
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
import { Field, FieldGroup, FieldLabel, FieldError, FieldDescription } from "@/components/ui/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { ModuleIcon } from "@/components/layout/module-icon";
import { getRanchAnimals, getRanchLots } from "@/features/animals/api/animals-api";
import { PRODUCTIVE_STATUS_IDS, type RanchAnimal, type RanchLot } from "@/features/animals/types";
import { registerFatteningEntry } from "@/features/fattening/api/fattening-api";
import { fatteningEntrySchema, type FatteningEntryValues } from "@/features/fattening/schemas/fattening-entry-schema";
import { FATTENING_SYSTEM_TYPE_LABELS } from "@/features/fattening/types";
import { useAuth } from "@/features/auth/context/use-auth";
import { translateError } from "@/lib/error-messages";

interface FatteningEntryDialogProps {
  idRanch: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

const emptyValues: Partial<z.input<typeof fatteningEntrySchema>> = {
  systemType: undefined,
  notes: "",
  eventDate: "",
};

export function FatteningEntryDialog({ idRanch, open, onOpenChange, onCreated }: FatteningEntryDialogProps) {
  const { session } = useAuth();
  const [rearingAnimals, setRearingAnimals] = useState<RanchAnimal[]>([]);
  const [fatteningLots, setFatteningLots] = useState<RanchLot[]>([]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof fatteningEntrySchema>, unknown, FatteningEntryValues>({
    resolver: zodResolver(fatteningEntrySchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!open || !session) return;
    reset(emptyValues);
    Promise.all([getRanchAnimals(idRanch, 1, session.accessToken, 200), getRanchLots(idRanch, session.accessToken)])
      .then(([animalsRes, lots]) => {
        setRearingAnimals(animalsRes.data.filter((a) => a.idProductiveStatus === PRODUCTIVE_STATUS_IDS.RECRIA));
        setFatteningLots(lots.filter((l) => l.lotType === "engorde"));
      })
      .catch((error) => toast.error(translateError(error, "No se pudieron cargar los datos.")));
  }, [open, session, idRanch, reset]);

  const onSubmit = async (values: FatteningEntryValues) => {
    if (!session) return;
    try {
      await registerFatteningEntry(
        {
          idRanchAnimal: values.idRanchAnimal,
          idLotDest: values.idLotDest,
          systemType: values.systemType,
          initialWeight: values.initialWeight,
          notes: values.notes || undefined,
          eventDate: new Date(values.eventDate).toISOString(),
        },
        session.accessToken,
      );
      toast.success("Ingreso a engorde registrado");
      onCreated();
      onOpenChange(false);
    } catch (error) {
      toast.error(translateError(error, "No se pudo registrar el ingreso a engorde."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="flex-row items-center gap-3 space-y-0">
          <ModuleIcon icon={UtensilsCrossed} color="green" size="sm" />
          <div>
            <DialogTitle>Nuevo ingreso a engorde</DialogTitle>
            <DialogDescription>Mueve un animal de Recría a Engorde directamente.</DialogDescription>
          </div>
        </DialogHeader>

        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field data-invalid={!!errors.idRanchAnimal}>
              <FieldLabel htmlFor="idRanchAnimal">Animal (en Recría)</FieldLabel>
              <Controller
                control={control}
                name="idRanchAnimal"
                render={({ field }) => (
                  <Select
                    items={[
                      { label: "Elegí el animal", value: null },
                      ...rearingAnimals.map((a) => ({ label: a.code, value: a.id })),
                    ]}
                    value={field.value ?? null}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="idRanchAnimal" className="w-full" aria-invalid={!!errors.idRanchAnimal}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {rearingAnimals.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.code}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              {rearingAnimals.length === 0 ? <FieldDescription>No hay animales en Recría todavía.</FieldDescription> : null}
              <FieldError errors={[errors.idRanchAnimal]} />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field data-invalid={!!errors.idLotDest}>
                <FieldLabel htmlFor="idLotDest">Lote de engorde</FieldLabel>
                <Controller
                  control={control}
                  name="idLotDest"
                  render={({ field }) => (
                    <Select
                      items={[
                        { label: "Elegí el lote", value: null },
                        ...fatteningLots.map((l) => ({ label: l.name, value: l.id })),
                      ]}
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

            <div className="grid grid-cols-2 gap-4">
              <Field data-invalid={!!errors.initialWeight}>
                <FieldLabel htmlFor="initialWeight">Peso inicial (kg, opcional)</FieldLabel>
                <Input
                  id="initialWeight"
                  type="number"
                  step="0.01"
                  min="0"
                  aria-invalid={!!errors.initialWeight}
                  {...register("initialWeight")}
                />
                <FieldError errors={[errors.initialWeight]} />
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
              Registrar ingreso
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
