import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShoppingCart } from "lucide-react";
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
import { getAnimalBreeds, getAnimalClasses, getRanchLots } from "@/features/animals/api/animals-api";
import { PRODUCTIVE_STATUS_LABELS, type AnimalBreed, type AnimalClass, type RanchLot } from "@/features/animals/types";
import { registerMovement } from "@/features/movements/api/movements-api";
import { purchaseSchema, type PurchaseValues } from "@/features/movements/schemas/purchase-schema";
import { useAuth } from "@/features/auth/context/use-auth";
import { translateError } from "@/lib/error-messages";

interface PurchaseDialogProps {
  idRanch: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

const emptyValues: Partial<z.input<typeof purchaseSchema>> = {
  code: "",
  sex: undefined,
  birthdate: "",
  originName: "",
  notes: "",
  movementDate: "",
};

export function PurchaseDialog({ idRanch, open, onOpenChange, onCreated }: PurchaseDialogProps) {
  const { session } = useAuth();
  const [breeds, setBreeds] = useState<AnimalBreed[]>([]);
  const [classes, setClasses] = useState<AnimalClass[]>([]);
  const [lots, setLots] = useState<RanchLot[]>([]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof purchaseSchema>, unknown, PurchaseValues>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: emptyValues,
  });

  const selectedSex = watch("sex");

  useEffect(() => {
    if (!open || !session) return;
    reset(emptyValues);
    Promise.all([getAnimalBreeds(session.accessToken), getAnimalClasses(session.accessToken), getRanchLots(idRanch, session.accessToken)])
      .then(([breedsRes, classesRes, lotsRes]) => {
        setBreeds(breedsRes.breeds);
        setClasses(classesRes);
        setLots(lotsRes);
      })
      .catch((error) => toast.error(translateError(error, "No se pudieron cargar los catálogos.")));
  }, [open, session, idRanch, reset]);

  const classItems = useMemo(() => classes.filter((c) => !selectedSex || c.sex === selectedSex), [classes, selectedSex]);
  const statusItems = Object.entries(PRODUCTIVE_STATUS_LABELS).filter(([id]) => id !== "4");

  const onSubmit = async (values: PurchaseValues) => {
    if (!session) return;
    try {
      await registerMovement(
        {
          idRanch,
          idUser: session.idUser,
          movementType: "purchase",
          movementDate: new Date(values.movementDate).toISOString(),
          originName: values.originName || undefined,
          totalPrice: values.totalPrice,
          pricePerKg: values.pricePerKg,
          notes: values.notes || undefined,
          animals: [
            {
              newAnimal: {
                code: values.code,
                sex: values.sex,
                idBreed: values.idBreed,
                idAnimalClass: values.idAnimalClass,
                birthdate: values.birthdate,
                weight: values.weight,
                idLot: values.idLot,
                idProductiveStatus: values.idProductiveStatus,
              },
            },
          ],
        },
        session.accessToken,
      );
      toast.success(`Compra registrada — ${values.code} ingresó a la estancia`);
      onCreated();
      onOpenChange(false);
    } catch (error) {
      toast.error(translateError(error, "No se pudo registrar la compra."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="flex-row items-center gap-3 space-y-0">
          <ModuleIcon icon={ShoppingCart} color="green" size="sm" />
          <div>
            <DialogTitle>Registrar compra</DialogTitle>
            <DialogDescription>Ingresa un animal nuevo comprado a otra estancia.</DialogDescription>
          </div>
        </DialogHeader>

        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <div className="grid grid-cols-2 gap-4">
              <Field data-invalid={!!errors.code}>
                <FieldLabel htmlFor="code">Código / caravana</FieldLabel>
                <Input id="code" placeholder="VACA-001" aria-invalid={!!errors.code} {...register("code")} />
                <FieldError errors={[errors.code]} />
              </Field>
              <Field data-invalid={!!errors.sex}>
                <FieldLabel htmlFor="sex">Sexo</FieldLabel>
                <Controller
                  control={control}
                  name="sex"
                  render={({ field }) => (
                    <Select
                      items={[
                        { label: "Elegí el sexo", value: null },
                        { label: "Hembra", value: "F" },
                        { label: "Macho", value: "M" },
                      ]}
                      value={field.value ?? null}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger id="sex" className="w-full" aria-invalid={!!errors.sex}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="F">Hembra</SelectItem>
                          <SelectItem value="M">Macho</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.sex]} />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field data-invalid={!!errors.idBreed}>
                <FieldLabel htmlFor="idBreed">Raza</FieldLabel>
                <Controller
                  control={control}
                  name="idBreed"
                  render={({ field }) => (
                    <Select
                      items={[{ label: "Elegí una raza", value: null }, ...breeds.map((b) => ({ label: b.name, value: b.id }))]}
                      value={field.value ?? null}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger id="idBreed" className="w-full" aria-invalid={!!errors.idBreed}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {breeds.map((b) => (
                            <SelectItem key={b.id} value={b.id}>
                              {b.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.idBreed]} />
              </Field>

              <Field data-invalid={!!errors.idAnimalClass}>
                <FieldLabel htmlFor="idAnimalClass">Clase</FieldLabel>
                <Controller
                  control={control}
                  name="idAnimalClass"
                  render={({ field }) => (
                    <Select
                      items={[{ label: "Elegí una clase", value: null }, ...classItems.map((c) => ({ label: c.name, value: c.id }))]}
                      value={field.value ?? null}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger id="idAnimalClass" className="w-full" aria-invalid={!!errors.idAnimalClass}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {classItems.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.idAnimalClass]} />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field data-invalid={!!errors.birthdate}>
                <FieldLabel htmlFor="birthdate">Fecha de nacimiento</FieldLabel>
                <Input id="birthdate" type="date" aria-invalid={!!errors.birthdate} {...register("birthdate")} />
                <FieldError errors={[errors.birthdate]} />
              </Field>
              <Field data-invalid={!!errors.weight}>
                <FieldLabel htmlFor="weight">Peso (kg, opcional)</FieldLabel>
                <Input id="weight" type="number" step="0.01" min="0" aria-invalid={!!errors.weight} {...register("weight")} />
                <FieldError errors={[errors.weight]} />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field data-invalid={!!errors.idProductiveStatus}>
                <FieldLabel htmlFor="idProductiveStatus">Etapa productiva (opcional)</FieldLabel>
                <Controller
                  control={control}
                  name="idProductiveStatus"
                  render={({ field }) => (
                    <Select
                      items={[{ label: "Sin definir", value: null }, ...statusItems.map(([id, label]) => ({ label, value: Number(id) }))]}
                      value={field.value ?? null}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger id="idProductiveStatus" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {statusItems.map(([id, label]) => (
                            <SelectItem key={id} value={Number(id)}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="idLot">Lote (opcional)</FieldLabel>
                <Controller
                  control={control}
                  name="idLot"
                  render={({ field }) => (
                    <Select
                      items={[{ label: "Sin lote", value: null }, ...lots.map((l) => ({ label: l.name, value: l.id }))]}
                      value={field.value ?? null}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger id="idLot" className="w-full">
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
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="originName">Vendedor / estancia de origen (opcional)</FieldLabel>
              <Input id="originName" {...register("originName")} />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field data-invalid={!!errors.totalPrice}>
                <FieldLabel htmlFor="totalPrice">Precio total (opcional)</FieldLabel>
                <Input id="totalPrice" type="number" step="0.01" min="0" aria-invalid={!!errors.totalPrice} {...register("totalPrice")} />
                <FieldError errors={[errors.totalPrice]} />
              </Field>
              <Field data-invalid={!!errors.movementDate}>
                <FieldLabel htmlFor="movementDate">Fecha</FieldLabel>
                <Input id="movementDate" type="date" aria-invalid={!!errors.movementDate} {...register("movementDate")} />
                <FieldError errors={[errors.movementDate]} />
              </Field>
            </div>

            <FieldDescription>Por ahora se registra un animal por compra — para varios, repetí la operación.</FieldDescription>
          </FieldGroup>

          <DialogFooter className="mt-6">
            <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Spinner data-icon="inline-start" /> : null}
              Registrar compra
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
