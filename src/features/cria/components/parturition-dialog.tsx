import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Baby } from "lucide-react";
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
import { getAnimalBreeds, getAnimalClasses } from "@/features/animals/api/animals-api";
import type { AnimalBreed, AnimalClass } from "@/features/animals/types";
import { registerParturition } from "@/features/cria/api/cria-api";
import { parturitionSchema, type ParturitionValues } from "@/features/cria/schemas/parturition-schema";
import { BIRTH_TYPE_LABELS, CRIA_STATUS_LABELS, MOTHER_CONDITION_LABELS, type GestationDiagnosis } from "@/features/cria/types";
import { useAuth } from "@/features/auth/context/use-auth";
import { translateError } from "@/lib/error-messages";

interface ParturitionDialogProps {
  diagnosis: GestationDiagnosis | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

const emptyValues: Partial<z.input<typeof parturitionSchema>> = {
  birthType: undefined,
  criaStatus: undefined,
  motherCondition: undefined,
  criaCode: "",
  criaSex: undefined,
  notes: "",
  eventDate: "",
};

export function ParturitionDialog({ diagnosis, open, onOpenChange, onCreated }: ParturitionDialogProps) {
  const { session } = useAuth();
  const [breeds, setBreeds] = useState<AnimalBreed[]>([]);
  const [classes, setClasses] = useState<AnimalClass[]>([]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof parturitionSchema>, unknown, ParturitionValues>({
    resolver: zodResolver(parturitionSchema),
    defaultValues: emptyValues,
  });

  const criaStatus = watch("criaStatus");
  const criaSex = watch("criaSex");

  useEffect(() => {
    if (!open || !session) return;
    reset(emptyValues);
    Promise.all([getAnimalBreeds(session.accessToken), getAnimalClasses(session.accessToken)])
      .then(([breedsRes, classesRes]) => {
        setBreeds(breedsRes.breeds);
        setClasses(classesRes);
      })
      .catch((error) => toast.error(translateError(error, "No se pudieron cargar los catálogos.")));
  }, [open, session, reset]);

  const classItems = useMemo(
    () => classes.filter((c) => !criaSex || c.sex === criaSex),
    [classes, criaSex],
  );

  const onSubmit = async (values: ParturitionValues) => {
    if (!session || !diagnosis) return;
    try {
      await registerParturition(
        {
          idRanchAnimal: diagnosis.event.idRanchAnimal,
          idDiagnosis: diagnosis.id,
          birthType: values.birthType,
          criaStatus: values.criaStatus,
          criaWeight: values.criaWeight,
          motherCondition: values.motherCondition,
          criaData:
            values.criaStatus === "alive"
              ? {
                  code: values.criaCode!,
                  idBreed: values.criaIdBreed!,
                  idStatus: 1,
                  idAnimalClass: values.criaIdAnimalClass!,
                  sex: values.criaSex!,
                  weight: values.criaWeight,
                }
              : undefined,
          notes: values.notes || undefined,
          eventDate: new Date(values.eventDate).toISOString(),
        },
        session.accessToken,
      );
      toast.success(`Parto registrado para ${diagnosis.event.animal.code}`);
      onCreated();
      onOpenChange(false);
    } catch (error) {
      toast.error(translateError(error, "No se pudo registrar el parto."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="flex-row items-center gap-3 space-y-0">
          <ModuleIcon icon={Baby} color="orange" size="sm" />
          <div>
            <DialogTitle>Registrar parto</DialogTitle>
            <DialogDescription>{diagnosis ? `Madre: ${diagnosis.event.animal.code}` : ""}</DialogDescription>
          </div>
        </DialogHeader>

        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <div className="grid grid-cols-2 gap-4">
              <Field data-invalid={!!errors.birthType}>
                <FieldLabel htmlFor="birthType">Tipo de parto</FieldLabel>
                <Controller
                  control={control}
                  name="birthType"
                  render={({ field }) => (
                    <Select
                      items={[
                        { label: "Elegí el tipo", value: null },
                        ...Object.entries(BIRTH_TYPE_LABELS).map(([value, label]) => ({ label, value })),
                      ]}
                      value={field.value ?? null}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger id="birthType" className="w-full" aria-invalid={!!errors.birthType}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {Object.entries(BIRTH_TYPE_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.birthType]} />
              </Field>

              <Field data-invalid={!!errors.motherCondition}>
                <FieldLabel htmlFor="motherCondition">Condición de la madre (opcional)</FieldLabel>
                <Controller
                  control={control}
                  name="motherCondition"
                  render={({ field }) => (
                    <Select
                      items={[
                        { label: "Elegí una opción", value: null },
                        ...Object.entries(MOTHER_CONDITION_LABELS).map(([value, label]) => ({ label, value })),
                      ]}
                      value={field.value ?? null}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger id="motherCondition" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {Object.entries(MOTHER_CONDITION_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
            </div>

            <Field data-invalid={!!errors.criaStatus}>
              <FieldLabel htmlFor="criaStatus">Estado de la cría</FieldLabel>
              <Controller
                control={control}
                name="criaStatus"
                render={({ field }) => (
                  <Select
                    items={[
                      { label: "Elegí el estado", value: null },
                      ...Object.entries(CRIA_STATUS_LABELS).map(([value, label]) => ({ label, value })),
                    ]}
                    value={field.value ?? null}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="criaStatus" className="w-full" aria-invalid={!!errors.criaStatus}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {Object.entries(CRIA_STATUS_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[errors.criaStatus]} />
            </Field>

            {criaStatus === "dead" ? (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                No se crea un animal nuevo — la cría no sobrevivió al parto.
              </p>
            ) : null}

            {criaStatus === "alive" ? (
              <>
                <Field data-invalid={!!errors.criaCode}>
                  <FieldLabel htmlFor="criaCode">Código de la cría</FieldLabel>
                  <Input id="criaCode" placeholder="TER-001" aria-invalid={!!errors.criaCode} {...register("criaCode")} />
                  <FieldError errors={[errors.criaCode]} />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field data-invalid={!!errors.criaSex}>
                    <FieldLabel htmlFor="criaSex">Sexo de la cría</FieldLabel>
                    <Controller
                      control={control}
                      name="criaSex"
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
                          <SelectTrigger id="criaSex" className="w-full" aria-invalid={!!errors.criaSex}>
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
                    <FieldError errors={[errors.criaSex]} />
                  </Field>

                  <Field data-invalid={!!errors.criaIdBreed}>
                    <FieldLabel htmlFor="criaIdBreed">Raza</FieldLabel>
                    <Controller
                      control={control}
                      name="criaIdBreed"
                      render={({ field }) => (
                        <Select
                          items={[{ label: "Elegí una raza", value: null }, ...breeds.map((b) => ({ label: b.name, value: b.id }))]}
                          value={field.value ?? null}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger id="criaIdBreed" className="w-full" aria-invalid={!!errors.criaIdBreed}>
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
                    <FieldError errors={[errors.criaIdBreed]} />
                  </Field>
                </div>

                <Field data-invalid={!!errors.criaIdAnimalClass}>
                  <FieldLabel htmlFor="criaIdAnimalClass">Clase</FieldLabel>
                  <Controller
                    control={control}
                    name="criaIdAnimalClass"
                    render={({ field }) => (
                      <Select
                        items={[{ label: "Elegí una clase", value: null }, ...classItems.map((c) => ({ label: c.name, value: c.id }))]}
                        value={field.value ?? null}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger id="criaIdAnimalClass" className="w-full" aria-invalid={!!errors.criaIdAnimalClass}>
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
                  <FieldError errors={[errors.criaIdAnimalClass]} />
                </Field>
              </>
            ) : null}

            <div className="grid grid-cols-2 gap-4">
              <Field data-invalid={!!errors.criaWeight}>
                <FieldLabel htmlFor="criaWeight">Peso de la cría (kg, opcional)</FieldLabel>
                <Input id="criaWeight" type="number" step="0.01" min="0" aria-invalid={!!errors.criaWeight} {...register("criaWeight")} />
                <FieldError errors={[errors.criaWeight]} />
              </Field>
              <Field data-invalid={!!errors.eventDate}>
                <FieldLabel htmlFor="eventDate">Fecha del parto</FieldLabel>
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
              Registrar parto
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
