import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Fence } from "lucide-react";
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
import { createRanchPasture, updateRanchPasture } from "@/features/pastures/api/pastures-api";
import { pastureSchema, type PastureValues } from "@/features/pastures/schemas/pasture-schema";
import type { RanchPasture } from "@/features/pastures/types";
import { useAuth } from "@/features/auth/context/use-auth";
import { translateError } from "@/lib/error-messages";

interface PastureDialogProps {
  idRanch: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
  pasture?: RanchPasture | null;
}

const emptyValues: Partial<PastureValues> = { name: "", description: "" };

export function PastureDialog({ idRanch, open, onOpenChange, onSaved, pasture }: PastureDialogProps) {
  const { session } = useAuth();
  const isEditing = !!pasture;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof pastureSchema>, unknown, PastureValues>({
    resolver: zodResolver(pastureSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!open) return;
    reset(
      pasture
        ? { name: pasture.name, areaHectares: Number(pasture.areaHectares), description: pasture.description ?? "" }
        : emptyValues,
    );
  }, [open, pasture, reset]);

  const onSubmit = async (values: PastureValues) => {
    if (!session) return;
    try {
      if (isEditing) {
        await updateRanchPasture(pasture.id, values, session.accessToken);
        toast.success(`Potrero ${values.name} actualizado`);
      } else {
        await createRanchPasture({ idRanch, ...values }, session.accessToken);
        toast.success(`Potrero ${values.name} creado`);
      }
      onSaved();
      onOpenChange(false);
    } catch (error) {
      toast.error(translateError(error, "No se pudo guardar el potrero."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="flex-row items-center gap-3 space-y-0">
          <ModuleIcon icon={Fence} color="accent" size="sm" />
          <div>
            <DialogTitle>{isEditing ? "Editar potrero" : "Nuevo potrero"}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Actualizá los datos del potrero." : "Registrá una división de campo en tu estancia."}
            </DialogDescription>
          </div>
        </DialogHeader>

        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="name">Nombre</FieldLabel>
              <Input id="name" placeholder="Potrero Norte" aria-invalid={!!errors.name} {...register("name")} />
              <FieldError errors={[errors.name]} />
            </Field>

            <Field data-invalid={!!errors.areaHectares}>
              <FieldLabel htmlFor="areaHectares">Superficie (hectáreas)</FieldLabel>
              <Input
                id="areaHectares"
                type="number"
                step="0.01"
                min="0"
                aria-invalid={!!errors.areaHectares}
                {...register("areaHectares")}
              />
              <FieldError errors={[errors.areaHectares]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="description">Descripción (opcional)</FieldLabel>
              <Input id="description" placeholder="Campo natural con agua permanente" {...register("description")} />
            </Field>
          </FieldGroup>

          <DialogFooter className="mt-6">
            <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Spinner data-icon="inline-start" /> : null}
              {isEditing ? "Guardar cambios" : "Crear potrero"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
