import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DollarSign } from "lucide-react";
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
import { saleSchema, type SaleValues } from "@/features/movements/schemas/sale-schema";
import { useAuth } from "@/features/auth/context/use-auth";
import { translateError } from "@/lib/error-messages";

interface SaleDialogProps {
  idRanch: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

const emptyValues: Partial<z.input<typeof saleSchema>> = { animalIds: [], notes: "", movementDate: "" };

export function SaleDialog({ idRanch, open, onOpenChange, onCreated }: SaleDialogProps) {
  const { session } = useAuth();
  const [animals, setAnimals] = useState<RanchAnimal[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof saleSchema>, unknown, SaleValues>({
    resolver: zodResolver(saleSchema),
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

  const onSubmit = async (values: SaleValues) => {
    if (!session) return;
    try {
      await registerMovement(
        {
          idRanch,
          idUser: session.idUser,
          movementType: "sale",
          movementDate: new Date(values.movementDate).toISOString(),
          counterpartName: values.counterpartName,
          totalPrice: values.totalPrice,
          pricePerKg: values.pricePerKg,
          notes: values.notes || undefined,
          animals: values.animalIds.map((idRanchAnimal) => ({ idRanchAnimal })),
        },
        session.accessToken,
      );
      toast.success("Venta registrada — queda pendiente de confirmación por animal.");
      onCreated();
      onOpenChange(false);
    } catch (error) {
      toast.error(translateError(error, "No se pudo registrar la venta."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="flex-row items-center gap-3 space-y-0">
          <ModuleIcon icon={DollarSign} color="orange" size="sm" />
          <div>
            <DialogTitle>Registrar venta</DialogTitle>
            <DialogDescription>Queda pendiente hasta confirmar cada animal.</DialogDescription>
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
              <FieldLabel htmlFor="counterpartName">Comprador</FieldLabel>
              <Input id="counterpartName" aria-invalid={!!errors.counterpartName} {...register("counterpartName")} />
              <FieldError errors={[errors.counterpartName]} />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field data-invalid={!!errors.totalPrice}>
                <FieldLabel htmlFor="totalPrice">Precio total (opcional)</FieldLabel>
                <Input id="totalPrice" type="number" step="0.01" min="0" aria-invalid={!!errors.totalPrice} {...register("totalPrice")} />
                <FieldError errors={[errors.totalPrice]} />
              </Field>
              <Field data-invalid={!!errors.pricePerKg}>
                <FieldLabel htmlFor="pricePerKg">Precio por kg (opcional)</FieldLabel>
                <Input id="pricePerKg" type="number" step="0.01" min="0" aria-invalid={!!errors.pricePerKg} {...register("pricePerKg")} />
                <FieldError errors={[errors.pricePerKg]} />
              </Field>
            </div>

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
              Registrar venta
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
