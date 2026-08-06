import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogOut } from "lucide-react";
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
import { getRanchAnimals } from "@/features/animals/api/animals-api";
import { ANIMAL_STATUS_IDS, type RanchAnimal } from "@/features/animals/types";
import { AnimalMultiSelect } from "@/features/movements/components/animal-multi-select";
import { registerMovement } from "@/features/movements/api/movements-api";
import { ranchExitSchema, type RanchExitValues } from "@/features/movements/schemas/ranch-exit-schema";
import { useAuth } from "@/features/auth/context/use-auth";
import { translateError } from "@/lib/error-messages";

interface RanchExitDialogProps {
  idRanch: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

const emptyValues: Partial<z.input<typeof ranchExitSchema>> = { animalIds: [], notes: "", movementDate: "" };

export function RanchExitDialog({ idRanch, open, onOpenChange, onCreated }: RanchExitDialogProps) {
  const { session } = useAuth();
  const [animals, setAnimals] = useState<RanchAnimal[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof ranchExitSchema>, unknown, RanchExitValues>({
    resolver: zodResolver(ranchExitSchema),
    defaultValues: emptyValues,
  });

  const animalIds = watch("animalIds") ?? [];

  useEffect(() => {
    if (!open || !session) return;
    reset(emptyValues);
    getRanchAnimals(idRanch, 1, session.accessToken, 200)
      .then((res) => setAnimals(res.data.filter((a) => a.status.id === ANIMAL_STATUS_IDS.ACTIVE)))
      .catch((error) => toast.error(translateError(error, "No se pudieron cargar los animales.")));
  }, [open, session, idRanch, reset]);

  const onSubmit = async (values: RanchExitValues) => {
    if (!session) return;
    try {
      await registerMovement(
        {
          idRanch,
          movementType: "ranch_exit",
          movementDate: new Date(values.movementDate).toISOString(),
          counterpartName: values.counterpartName,
          notes: values.notes || undefined,
          animals: values.animalIds.map((idRanchAnimal) => ({ idRanchAnimal })),
        },
        session.accessToken,
      );
      toast.success("Salida a otra estancia registrada — irreversible.");
      onCreated();
      onOpenChange(false);
    } catch (error) {
      toast.error(translateError(error, "No se pudo registrar la salida."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="flex-row items-center gap-3 space-y-0">
          <ModuleIcon icon={LogOut} color="orange" size="sm" />
          <div>
            <DialogTitle>Salida a otra estancia</DialogTitle>
            <DialogDescription>Se confirma al instante y es irreversible.</DialogDescription>
          </div>
        </DialogHeader>

        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field data-invalid={!!errors.animalIds}>
              <FieldLabel>Animales</FieldLabel>
              <AnimalMultiSelect animals={animals} selectedIds={animalIds} onChange={(ids) => setValue("animalIds", ids)} />
              <FieldError errors={[errors.animalIds]} />
            </Field>

            <Field data-invalid={!!errors.counterpartName}>
              <FieldLabel htmlFor="counterpartName">Estancia destino</FieldLabel>
              <Input id="counterpartName" aria-invalid={!!errors.counterpartName} {...register("counterpartName")} />
              <FieldError errors={[errors.counterpartName]} />
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
              Registrar salida
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
