import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { createRanchAnimal, getAnimalBreeds, getAnimalClasses, getRanchLots } from "@/features/animals/api/animals-api";
import { createAnimalSchema, type CreateAnimalValues } from "@/features/animals/schemas/create-animal-schema";
import { PRODUCTIVE_STATUS_LABELS, type AnimalBreed, type AnimalClass, type RanchLot } from "@/features/animals/types";
import { useAuth } from "@/features/auth/context/use-auth";
import { translateError } from "@/lib/error-messages";

interface CreateAnimalDialogProps {
  idRanch: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

const emptyValues: Partial<CreateAnimalValues> = {
  code: "",
  sex: undefined,
  birthdate: "",
  origin: "",
  codeMother: "",
  codeFather: "",
};

export function CreateAnimalDialog({ idRanch, open, onOpenChange, onCreated }: CreateAnimalDialogProps) {
  const { session } = useAuth();
  const [classes, setClasses] = useState<AnimalClass[]>([]);
  const [breeds, setBreeds] = useState<AnimalBreed[]>([]);
  const [lots, setLots] = useState<RanchLot[]>([]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof createAnimalSchema>, unknown, CreateAnimalValues>({
    resolver: zodResolver(createAnimalSchema),
    defaultValues: emptyValues,
  });

  const selectedSex = watch("sex");

  useEffect(() => {
    if (!open || !session) return;
    reset(emptyValues);
    Promise.all([getAnimalClasses(session.accessToken), getAnimalBreeds(session.accessToken), getRanchLots(idRanch, session.accessToken)])
      .then(([classesRes, breedsRes, lotsRes]) => {
        setClasses(classesRes);
        setBreeds(breedsRes.breeds);
        setLots(lotsRes);
      })
      .catch((error) => toast.error(translateError(error, "No se pudieron cargar los catálogos.")));
  }, [open, session, idRanch, reset]);

  const classItems = useMemo(
    () => [
      { label: "Elegí una clase", value: null },
      ...classes.filter((c) => !selectedSex || c.sex === selectedSex).map((c) => ({ label: c.name, value: c.id })),
    ],
    [classes, selectedSex],
  );
  const breedItems = [{ label: "Elegí una raza", value: null }, ...breeds.map((b) => ({ label: b.name, value: b.id }))];
  const lotItems = [{ label: "Sin lote", value: null }, ...lots.map((l) => ({ label: l.name, value: l.id }))];
  const statusItems = Object.entries(PRODUCTIVE_STATUS_LABELS)
    .filter(([id]) => id !== "4") // Baja no aplica al dar de alta un animal nuevo
    .map(([id, label]) => ({ label, value: Number(id) }));

  const onSubmit = async (values: CreateAnimalValues) => {
    if (!session) return;
    try {
      await createRanchAnimal(
        {
          idRanch,
          code: values.code,
          sex: values.sex,
          idBreed: values.idBreed,
          idAnimalClass: values.idAnimalClass,
          idStatus: 1, // Activo — un animal recién dado de alta siempre arranca así
          birthdate: values.birthdate,
          idProductiveStatus: values.idProductiveStatus,
          idLot: values.idLot,
          weight: values.weight,
          origin: values.origin || undefined,
          codeMother: values.codeMother || undefined,
          codeFather: values.codeFather || undefined,
          createdAt: new Date().toISOString(),
        },
        session.accessToken,
      );
      toast.success(`Animal ${values.code} registrado`);
      onCreated();
      onOpenChange(false);
    } catch (error) {
      toast.error(translateError(error, "No se pudo registrar el animal."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo animal</DialogTitle>
          <DialogDescription>Registrar un animal en la estancia.</DialogDescription>
        </DialogHeader>

        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
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

            <div className="grid grid-cols-2 gap-4">
              <Field data-invalid={!!errors.idBreed}>
                <FieldLabel htmlFor="idBreed">Raza</FieldLabel>
                <Controller
                  control={control}
                  name="idBreed"
                  render={({ field }) => (
                    <Select items={breedItems} value={field.value ?? null} onValueChange={field.onChange}>
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
                    <Select items={classItems} value={field.value ?? null} onValueChange={field.onChange}>
                      <SelectTrigger id="idAnimalClass" className="w-full" aria-invalid={!!errors.idAnimalClass}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {classes
                            .filter((c) => !selectedSex || c.sex === selectedSex)
                            .map((c) => (
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
                <FieldLabel htmlFor="idProductiveStatus">Etapa productiva</FieldLabel>
                <Controller
                  control={control}
                  name="idProductiveStatus"
                  render={({ field }) => (
                    <Select items={statusItems} value={field.value ?? null} onValueChange={field.onChange}>
                      <SelectTrigger id="idProductiveStatus" className="w-full" aria-invalid={!!errors.idProductiveStatus}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {statusItems
                            .filter((i) => i.value !== null)
                            .map((i) => (
                              <SelectItem key={i.value} value={i.value as number}>
                                {i.label}
                              </SelectItem>
                            ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.idProductiveStatus]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="idLot">Lote (opcional)</FieldLabel>
                <Controller
                  control={control}
                  name="idLot"
                  render={({ field }) => (
                    <Select items={lotItems} value={field.value ?? null} onValueChange={field.onChange}>
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

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="codeMother">Código de la madre (opcional)</FieldLabel>
                <Input id="codeMother" placeholder="VACA-002" {...register("codeMother")} />
              </Field>
              <Field>
                <FieldLabel htmlFor="codeFather">Código del padre (opcional)</FieldLabel>
                <Input id="codeFather" placeholder="TORO-001" {...register("codeFather")} />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="origin">Origen (opcional)</FieldLabel>
              <Input id="origin" placeholder="Compra, nacido en la estancia, etc." {...register("origin")} />
            </Field>
          </FieldGroup>

          <DialogFooter className="mt-6">
            <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Spinner data-icon="inline-start" /> : null}
              Registrar animal
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
