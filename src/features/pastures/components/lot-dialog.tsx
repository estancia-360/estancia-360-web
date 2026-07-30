import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Group } from "lucide-react";
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
import { createRanchLot, updateRanchLot } from "@/features/pastures/api/pastures-api";
import { lotSchema, type LotValues } from "@/features/pastures/schemas/lot-schema";
import { LOT_TYPE_LABELS, type RanchLot, type RanchPasture } from "@/features/pastures/types";
import { useAuth } from "@/features/auth/context/use-auth";
import { translateError } from "@/lib/error-messages";

interface LotDialogProps {
  idRanch: number;
  pastures: RanchPasture[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
  lot?: RanchLot | null;
  defaultPastureId?: number;
}

const lotTypeItems = [
  { label: "Elegí el tipo", value: null },
  ...Object.entries(LOT_TYPE_LABELS).map(([value, label]) => ({ label, value })),
];

export function LotDialog({ idRanch, pastures, open, onOpenChange, onSaved, lot, defaultPastureId }: LotDialogProps) {
  const { session } = useAuth();
  const isEditing = !!lot;

  const emptyValues: Partial<z.input<typeof lotSchema>> = {
    idRanchPasture: defaultPastureId,
    name: "",
    lotType: undefined,
    capacity: undefined,
  };

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof lotSchema>, unknown, LotValues>({
    resolver: zodResolver(lotSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!open) return;
    reset(
      lot
        ? { idRanchPasture: lot.idRanchPasture, name: lot.name, lotType: lot.lotType, capacity: lot.capacity ?? undefined }
        : emptyValues,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, lot, defaultPastureId, reset]);

  const onSubmit = async (values: LotValues) => {
    if (!session) return;
    try {
      if (isEditing) {
        await updateRanchLot(lot.id, { name: values.name, lotType: values.lotType, capacity: values.capacity }, session.accessToken);
        toast.success(`Lote ${values.name} actualizado`);
      } else {
        await createRanchLot({ idRanch, ...values }, session.accessToken);
        toast.success(`Lote ${values.name} creado`);
      }
      onSaved();
      onOpenChange(false);
    } catch (error) {
      toast.error(translateError(error, "No se pudo guardar el lote."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="flex-row items-center gap-3 space-y-0">
          <ModuleIcon icon={Group} color="accent" size="sm" />
          <div>
            <DialogTitle>{isEditing ? "Editar lote" : "Nuevo lote"}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Actualizá los datos del lote." : "Un lote agrupa animales dentro de un potrero."}
            </DialogDescription>
          </div>
        </DialogHeader>

        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field data-invalid={!!errors.idRanchPasture}>
              <FieldLabel htmlFor="idRanchPasture">Potrero</FieldLabel>
              <Controller
                control={control}
                name="idRanchPasture"
                render={({ field }) => (
                  <Select
                    items={[{ label: "Elegí el potrero", value: null }, ...pastures.map((p) => ({ label: p.name, value: p.id }))]}
                    value={field.value ?? null}
                    onValueChange={field.onChange}
                    disabled={isEditing}
                  >
                    <SelectTrigger id="idRanchPasture" className="w-full" aria-invalid={!!errors.idRanchPasture}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {pastures.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[errors.idRanchPasture]} />
            </Field>

            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="name">Nombre</FieldLabel>
              <Input id="name" placeholder="Lote Recría 1" aria-invalid={!!errors.name} {...register("name")} />
              <FieldError errors={[errors.name]} />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field data-invalid={!!errors.lotType}>
                <FieldLabel htmlFor="lotType">Tipo</FieldLabel>
                <Controller
                  control={control}
                  name="lotType"
                  render={({ field }) => (
                    <Select items={lotTypeItems} value={field.value ?? null} onValueChange={field.onChange}>
                      <SelectTrigger id="lotType" className="w-full" aria-invalid={!!errors.lotType}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {Object.entries(LOT_TYPE_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.lotType]} />
              </Field>

              <Field data-invalid={!!errors.capacity}>
                <FieldLabel htmlFor="capacity">Capacidad (opcional)</FieldLabel>
                <Input id="capacity" type="number" min="1" aria-invalid={!!errors.capacity} {...register("capacity")} />
                <FieldError errors={[errors.capacity]} />
              </Field>
            </div>
          </FieldGroup>

          <DialogFooter className="mt-6">
            <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Spinner data-icon="inline-start" /> : null}
              {isEditing ? "Guardar cambios" : "Crear lote"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
