import { useEffect, useState } from "react";
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
import { Field, FieldGroup, FieldLabel, FieldError, FieldDescription } from "@/components/ui/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { ModuleIcon } from "@/components/layout/module-icon";
import { getRanchAnimals } from "@/features/animals/api/animals-api";
import type { RanchAnimal } from "@/features/animals/types";
import { registerBreedingService } from "@/features/cria/api/cria-api";
import {
  registerBreedingServiceSchema,
  type RegisterBreedingServiceValues,
} from "@/features/cria/schemas/register-breeding-service-schema";
import { SERVICE_TYPE_LABELS } from "@/features/cria/types";
import { useAuth } from "@/features/auth/context/use-auth";
import { translateError } from "@/lib/error-messages";

interface RegisterBreedingServiceDialogProps {
  idRanch: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

const emptyValues = {
  idRanchAnimal: undefined,
  serviceType: undefined,
  idAnimalMale: undefined,
  semenBreed: "",
  technician: "",
  reproductiveLot: "",
  eventDate: "",
} as unknown as z.input<typeof registerBreedingServiceSchema>;

export function RegisterBreedingServiceDialog({ idRanch, open, onOpenChange, onCreated }: RegisterBreedingServiceDialogProps) {
  const { session } = useAuth();
  const [animals, setAnimals] = useState<RanchAnimal[]>([]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof registerBreedingServiceSchema>, unknown, RegisterBreedingServiceValues>({
    resolver: zodResolver(registerBreedingServiceSchema),
    defaultValues: emptyValues,
  });

  const serviceType = watch("serviceType");

  useEffect(() => {
    if (!open || !session) return;
    reset(emptyValues);
    getRanchAnimals(idRanch, 1, session.accessToken)
      .then((res) => setAnimals(res.data))
      .catch((error) => toast.error(translateError(error, "No se pudieron cargar los animales.")));
  }, [open, session, idRanch, reset]);

  const females = animals.filter((a) => a.sex === "F");
  const males = animals.filter((a) => a.sex === "M");

  const onSubmit = async (values: RegisterBreedingServiceValues) => {
    if (!session) return;
    try {
      await registerBreedingService(
        {
          idRanchAnimal: values.idRanchAnimal,
          serviceType: values.serviceType,
          idAnimalMale: values.serviceType === "natural" ? values.idAnimalMale : undefined,
          semenBreed: values.semenBreed || undefined,
          technician: values.technician || undefined,
          reproductiveLot: values.reproductiveLot || undefined,
          eventDate: new Date(values.eventDate).toISOString(),
        },
        session.accessToken,
      );
      toast.success("Servicio de monta registrado");
      onCreated();
      onOpenChange(false);
    } catch (error) {
      toast.error(translateError(error, "No se pudo registrar el servicio."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="flex-row items-center gap-3 space-y-0">
          <ModuleIcon icon={Baby} color="orange" size="sm" />
          <div>
            <DialogTitle>Nuevo servicio de monta</DialogTitle>
            <DialogDescription>Primer paso del ciclo reproductivo — después vienen el diagnóstico y el parto.</DialogDescription>
          </div>
        </DialogHeader>

        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field data-invalid={!!errors.idRanchAnimal}>
              <FieldLabel htmlFor="idRanchAnimal">Hembra</FieldLabel>
              <Controller
                control={control}
                name="idRanchAnimal"
                render={({ field }) => (
                  <Select
                    items={[{ label: "Elegí la hembra", value: null }, ...females.map((f) => ({ label: f.code, value: f.id }))]}
                    value={field.value ?? null}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="idRanchAnimal" className="w-full" aria-invalid={!!errors.idRanchAnimal}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {females.map((f) => (
                          <SelectItem key={f.id} value={f.id}>
                            {f.code}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              {females.length === 0 ? <FieldDescription>No hay hembras registradas todavía.</FieldDescription> : null}
              <FieldError errors={[errors.idRanchAnimal]} />
            </Field>

            <Field data-invalid={!!errors.serviceType}>
              <FieldLabel htmlFor="serviceType">Tipo de servicio</FieldLabel>
              <Controller
                control={control}
                name="serviceType"
                render={({ field }) => (
                  <Select
                    items={[
                      { label: "Elegí el tipo", value: null },
                      ...Object.entries(SERVICE_TYPE_LABELS).map(([value, label]) => ({ label, value })),
                    ]}
                    value={field.value ?? null}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="serviceType" className="w-full" aria-invalid={!!errors.serviceType}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {Object.entries(SERVICE_TYPE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[errors.serviceType]} />
            </Field>

            {serviceType === "natural" ? (
              <Field data-invalid={!!errors.idAnimalMale}>
                <FieldLabel htmlFor="idAnimalMale">Macho</FieldLabel>
                <Controller
                  control={control}
                  name="idAnimalMale"
                  render={({ field }) => (
                    <Select
                      items={[{ label: "Elegí el macho", value: null }, ...males.map((m) => ({ label: m.code, value: m.id }))]}
                      value={field.value ?? null}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger id="idAnimalMale" className="w-full" aria-invalid={!!errors.idAnimalMale}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {males.map((m) => (
                            <SelectItem key={m.id} value={m.id}>
                              {m.code}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.idAnimalMale]} />
              </Field>
            ) : null}

            {serviceType === "artificial_insemination" ? (
              <Field>
                <FieldLabel htmlFor="semenBreed">Raza del semen (opcional)</FieldLabel>
                <Input id="semenBreed" placeholder="Angus, Brahman, etc." {...register("semenBreed")} />
              </Field>
            ) : null}

            <Field data-invalid={!!errors.eventDate}>
              <FieldLabel htmlFor="eventDate">Fecha del servicio</FieldLabel>
              <Input id="eventDate" type="date" aria-invalid={!!errors.eventDate} {...register("eventDate")} />
              <FieldError errors={[errors.eventDate]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="technician">Técnico (opcional)</FieldLabel>
              <Input id="technician" placeholder="Dr. Pérez" {...register("technician")} />
            </Field>

            <Field>
              <FieldLabel htmlFor="reproductiveLot">Lote reproductivo (opcional)</FieldLabel>
              <Input id="reproductiveLot" {...register("reproductiveLot")} />
            </Field>
          </FieldGroup>

          <DialogFooter className="mt-6">
            <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Spinner data-icon="inline-start" /> : null}
              Registrar servicio
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
