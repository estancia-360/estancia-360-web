import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftRight } from "lucide-react";
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
import { getRanchAnimals, getRanchLots } from "@/features/animals/api/animals-api";
import { ANIMAL_STATUS_IDS, type RanchAnimal, type RanchLot } from "@/features/animals/types";
import { AnimalMultiSelect } from "@/features/movements/components/animal-multi-select";
import { registerMovement } from "@/features/movements/api/movements-api";
import { transferSchema, type TransferValues } from "@/features/movements/schemas/transfer-schema";
import { useAuth } from "@/features/auth/context/use-auth";
import { translateError } from "@/lib/error-messages";

interface TransferDialogProps {
  idRanch: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

const emptyValues: Partial<z.input<typeof transferSchema>> = { animalIds: [], notes: "", movementDate: "" };

export function TransferDialog({ idRanch, open, onOpenChange, onCreated }: TransferDialogProps) {
  const { session } = useAuth();
  const [animals, setAnimals] = useState<RanchAnimal[]>([]);
  const [lots, setLots] = useState<RanchLot[]>([]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof transferSchema>, unknown, TransferValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: emptyValues,
  });

  const animalIds = watch("animalIds") ?? [];

  useEffect(() => {
    if (!open || !session) return;
    reset(emptyValues);
    Promise.all([getRanchAnimals(idRanch, 1, session.accessToken, 200), getRanchLots(idRanch, session.accessToken)])
      .then(([animalsRes, lotsRes]) => {
        setAnimals(animalsRes.data.filter((a) => a.status.id === ANIMAL_STATUS_IDS.ACTIVE));
        setLots(lotsRes);
      })
      .catch((error) => toast.error(translateError(error, "No se pudieron cargar los datos.")));
  }, [open, session, idRanch, reset]);

  const onSubmit = async (values: TransferValues) => {
    if (!session) return;
    try {
      await registerMovement(
        {
          idRanch,
          movementType: "pasture_transfer",
          movementDate: new Date(values.movementDate).toISOString(),
          notes: values.notes || undefined,
          animals: values.animalIds.map((idRanchAnimal) => ({ idRanchAnimal, idLotDest: values.idLotDest })),
        },
        session.accessToken,
      );
      toast.success("Traslado registrado");
      onCreated();
      onOpenChange(false);
    } catch (error) {
      toast.error(translateError(error, "No se pudo registrar el traslado."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="flex-row items-center gap-3 space-y-0">
          <ModuleIcon icon={ArrowLeftRight} color="blue" size="sm" />
          <div>
            <DialogTitle>Registrar traslado</DialogTitle>
            <DialogDescription>Mueve animales a otro lote — se confirma al instante.</DialogDescription>
          </div>
        </DialogHeader>

        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field data-invalid={!!errors.animalIds}>
              <FieldLabel>Animales</FieldLabel>
              <AnimalMultiSelect animals={animals} selectedIds={animalIds} onChange={(ids) => setValue("animalIds", ids)} />
              <FieldError errors={[errors.animalIds]} />
            </Field>

            <Field data-invalid={!!errors.idLotDest}>
              <FieldLabel htmlFor="idLotDest">Lote de destino</FieldLabel>
              <Controller
                control={control}
                name="idLotDest"
                render={({ field }) => (
                  <Select
                    items={[{ label: "Elegí el lote", value: null }, ...lots.map((l) => ({ label: l.name, value: l.id }))]}
                    value={field.value ?? null}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="idLotDest" className="w-full" aria-invalid={!!errors.idLotDest}>
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
              <FieldError errors={[errors.idLotDest]} />
            </Field>

            <Field data-invalid={!!errors.movementDate}>
              <FieldLabel htmlFor="movementDate">Fecha</FieldLabel>
              <Input id="movementDate" type="date" aria-invalid={!!errors.movementDate} {...register("movementDate")} />
              <FieldError errors={[errors.movementDate]} />
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
              Registrar traslado
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
