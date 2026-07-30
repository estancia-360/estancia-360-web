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
import { Field, FieldGroup, FieldLabel, FieldError, FieldDescription } from "@/components/ui/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { ModuleIcon } from "@/components/layout/module-icon";
import { getRanchLots } from "@/features/animals/api/animals-api";
import type { RanchLot } from "@/features/animals/types";
import { registerWeaning } from "@/features/cria/api/cria-api";
import { weaningSchema, type WeaningValues } from "@/features/cria/schemas/weaning-schema";
import type { Parturition } from "@/features/cria/types";
import { useAuth } from "@/features/auth/context/use-auth";
import { translateError } from "@/lib/error-messages";

interface WeaningDialogProps {
  idRanch: number;
  parturition: Parturition | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

const emptyValues: Partial<z.input<typeof weaningSchema>> = { notes: "", eventDate: "" };

export function WeaningDialog({ idRanch, parturition, open, onOpenChange, onCreated }: WeaningDialogProps) {
  const { session } = useAuth();
  const [lots, setLots] = useState<RanchLot[]>([]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof weaningSchema>, unknown, WeaningValues>({
    resolver: zodResolver(weaningSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!open || !session) return;
    reset(emptyValues);
    getRanchLots(idRanch, session.accessToken)
      .then(setLots)
      .catch((error) => toast.error(translateError(error, "No se pudieron cargar los lotes.")));
  }, [open, session, idRanch, reset]);

  const rearingLots = lots.filter((l) => l.lotType === "recria");

  const onSubmit = async (values: WeaningValues) => {
    if (!session || !parturition?.cria) return;
    try {
      await registerWeaning(
        {
          idRanchAnimal: parturition.cria.id,
          idLotDest: values.idLotDest,
          weaningWeight: values.weaningWeight,
          weaningAge: values.weaningAge,
          notes: values.notes || undefined,
          eventDate: new Date(values.eventDate).toISOString(),
        },
        session.accessToken,
      );
      toast.success(`Destete registrado para ${parturition.cria.code}`);
      onCreated();
      onOpenChange(false);
    } catch (error) {
      toast.error(translateError(error, "No se pudo registrar el destete."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="flex-row items-center gap-3 space-y-0">
          <ModuleIcon icon={ArrowRightCircle} color="orange" size="sm" />
          <div>
            <DialogTitle>Registrar destete</DialogTitle>
            <DialogDescription>{parturition?.cria ? `Cría ${parturition.cria.code} — pasa a Recría.` : ""}</DialogDescription>
          </div>
        </DialogHeader>

        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field data-invalid={!!errors.idLotDest}>
              <FieldLabel htmlFor="idLotDest">Lote de destino (Recría)</FieldLabel>
              <Controller
                control={control}
                name="idLotDest"
                render={({ field }) => (
                  <Select
                    items={[{ label: "Elegí el lote", value: null }, ...rearingLots.map((l) => ({ label: l.name, value: l.id }))]}
                    value={field.value ?? null}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="idLotDest" className="w-full" aria-invalid={!!errors.idLotDest}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {rearingLots.map((l) => (
                          <SelectItem key={l.id} value={l.id}>
                            {l.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              {rearingLots.length === 0 ? (
                <FieldDescription>No hay lotes de tipo Recría todavía — creá uno en Potreros y Lotes.</FieldDescription>
              ) : null}
              <FieldError errors={[errors.idLotDest]} />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field data-invalid={!!errors.weaningWeight}>
                <FieldLabel htmlFor="weaningWeight">Peso al destete (kg, opcional)</FieldLabel>
                <Input
                  id="weaningWeight"
                  type="number"
                  step="0.01"
                  min="0"
                  aria-invalid={!!errors.weaningWeight}
                  {...register("weaningWeight")}
                />
                <FieldError errors={[errors.weaningWeight]} />
              </Field>
              <Field data-invalid={!!errors.weaningAge}>
                <FieldLabel htmlFor="weaningAge">Edad en días (opcional)</FieldLabel>
                <Input id="weaningAge" type="number" min="1" aria-invalid={!!errors.weaningAge} {...register("weaningAge")} />
                <FieldError errors={[errors.weaningAge]} />
              </Field>
            </div>

            <Field data-invalid={!!errors.eventDate}>
              <FieldLabel htmlFor="eventDate">Fecha del destete</FieldLabel>
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
              Registrar destete
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
