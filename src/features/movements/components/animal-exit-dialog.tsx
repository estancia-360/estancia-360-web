import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Skull } from "lucide-react";
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
import { getRanchAnimals } from "@/features/animals/api/animals-api";
import { ANIMAL_STATUS_IDS, type RanchAnimal } from "@/features/animals/types";
import { registerAnimalExit } from "@/features/movements/api/movements-api";
import { animalExitSchema, type AnimalExitValues } from "@/features/movements/schemas/animal-exit-schema";
import { EXIT_REASON_LABELS } from "@/features/movements/types";
import { useAuth } from "@/features/auth/context/use-auth";
import { translateError } from "@/lib/error-messages";

interface AnimalExitDialogProps {
  idRanch: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

const emptyValues: Partial<z.input<typeof animalExitSchema>> = { reason: undefined, notes: "", eventDate: "" };

export function AnimalExitDialog({ idRanch, open, onOpenChange, onCreated }: AnimalExitDialogProps) {
  const { session } = useAuth();
  const [animals, setAnimals] = useState<RanchAnimal[]>([]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof animalExitSchema>, unknown, AnimalExitValues>({
    resolver: zodResolver(animalExitSchema),
    defaultValues: emptyValues,
  });

  const reason = watch("reason");

  useEffect(() => {
    if (!open || !session) return;
    reset(emptyValues);
    getRanchAnimals(idRanch, 1, session.accessToken, 200)
      .then((res) => setAnimals(res.data.filter((a) => a.status.id === ANIMAL_STATUS_IDS.ACTIVE)))
      .catch((error) => toast.error(translateError(error, "No se pudieron cargar los animales.")));
  }, [open, session, idRanch, reset]);

  const onSubmit = async (values: AnimalExitValues) => {
    if (!session) return;
    try {
      await registerAnimalExit(
        {
          idRanchAnimal: values.idRanchAnimal,
          reason: values.reason,
          notes: values.notes || undefined,
          eventDate: new Date(values.eventDate).toISOString(),
        },
        session.accessToken,
      );
      toast.success("Baja registrada — irreversible.");
      onCreated();
      onOpenChange(false);
    } catch (error) {
      toast.error(translateError(error, "No se pudo registrar la baja."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="flex-row items-center gap-3 space-y-0">
          <ModuleIcon icon={Skull} color="orange" size="sm" />
          <div>
            <DialogTitle>Registrar baja</DialogTitle>
            <DialogDescription>Muerte, descarte o pérdida — irreversible, no es una venta.</DialogDescription>
          </div>
        </DialogHeader>

        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field data-invalid={!!errors.idRanchAnimal}>
              <FieldLabel htmlFor="idRanchAnimal">Animal</FieldLabel>
              <Controller
                control={control}
                name="idRanchAnimal"
                render={({ field }) => (
                  <Select
                    items={[{ label: "Elegí el animal", value: null }, ...animals.map((a) => ({ label: a.code, value: a.id }))]}
                    value={field.value ?? null}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="idRanchAnimal" className="w-full" aria-invalid={!!errors.idRanchAnimal}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {animals.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.code}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[errors.idRanchAnimal]} />
            </Field>

            <Field data-invalid={!!errors.reason}>
              <FieldLabel htmlFor="reason">Motivo</FieldLabel>
              <Controller
                control={control}
                name="reason"
                render={({ field }) => (
                  <Select
                    items={[
                      { label: "Elegí el motivo", value: null },
                      ...Object.entries(EXIT_REASON_LABELS).map(([value, label]) => ({ label, value })),
                    ]}
                    value={field.value ?? null}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="reason" className="w-full" aria-invalid={!!errors.reason}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {Object.entries(EXIT_REASON_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[errors.reason]} />
            </Field>

            <Field data-invalid={!!errors.eventDate}>
              <FieldLabel htmlFor="eventDate">Fecha</FieldLabel>
              <Input id="eventDate" type="date" aria-invalid={!!errors.eventDate} {...register("eventDate")} />
              <FieldError errors={[errors.eventDate]} />
            </Field>

            <Field data-invalid={!!errors.notes}>
              <FieldLabel htmlFor="notes">Notas {reason === "other" ? "" : "(opcional)"}</FieldLabel>
              <Input id="notes" aria-invalid={!!errors.notes} {...register("notes")} />
              <FieldError errors={[errors.notes]} />
            </Field>
          </FieldGroup>

          <DialogFooter className="mt-6">
            <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Spinner data-icon="inline-start" /> : null}
              Registrar baja
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
