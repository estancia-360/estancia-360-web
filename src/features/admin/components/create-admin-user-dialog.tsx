import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
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
import { createAdminUser } from "@/features/admin/api/users-api";
import { createAdminUserSchema, type CreateAdminUserValues } from "@/features/admin/schemas/create-admin-user-schema";
import type { AdminUser } from "@/features/admin/types/users";
import { useAuth } from "@/features/auth/context/use-auth";
import { translateError } from "@/lib/error-messages";

interface CreateAdminUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (user: AdminUser) => void;
}

const emptyValues: CreateAdminUserValues = {
  ci: "",
  fullname: "",
  paternalSurname: "",
  maternalSurname: "",
  email: "",
  password: "",
  celphone: "",
};

export function CreateAdminUserDialog({ open, onOpenChange, onCreated }: CreateAdminUserDialogProps) {
  const { session } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateAdminUserValues>({
    resolver: zodResolver(createAdminUserSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (open) reset(emptyValues);
  }, [open, reset]);

  const onSubmit = async (values: CreateAdminUserValues) => {
    if (!session) return;
    try {
      const result = await createAdminUser(
        { ...values, celphone: values.celphone || undefined },
        session.accessToken,
      );
      toast.success(`${result.user.fullname} ahora es administrador`);
      onCreated(result.user);
      onOpenChange(false);
    } catch (error) {
      toast.error(translateError(error, "No se pudo crear el administrador."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo administrador</DialogTitle>
          <DialogDescription>
            Va a poder ingresar al panel admin con el rol Admin — mismo nivel de acceso que tu cuenta.
          </DialogDescription>
        </DialogHeader>

        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field data-invalid={!!errors.fullname}>
              <FieldLabel htmlFor="fullname">Nombre completo</FieldLabel>
              <Input id="fullname" placeholder="Juan Carlos Pérez" aria-invalid={!!errors.fullname} {...register("fullname")} />
              <FieldError errors={[errors.fullname]} />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field data-invalid={!!errors.paternalSurname}>
                <FieldLabel htmlFor="paternalSurname">Apellido paterno</FieldLabel>
                <Input id="paternalSurname" aria-invalid={!!errors.paternalSurname} {...register("paternalSurname")} />
                <FieldError errors={[errors.paternalSurname]} />
              </Field>
              <Field data-invalid={!!errors.maternalSurname}>
                <FieldLabel htmlFor="maternalSurname">Apellido materno</FieldLabel>
                <Input id="maternalSurname" aria-invalid={!!errors.maternalSurname} {...register("maternalSurname")} />
                <FieldError errors={[errors.maternalSurname]} />
              </Field>
            </div>

            <Field data-invalid={!!errors.ci}>
              <FieldLabel htmlFor="ci">Carnet de identidad</FieldLabel>
              <Input id="ci" placeholder="12345678" aria-invalid={!!errors.ci} {...register("ci")} />
              <FieldError errors={[errors.ci]} />
            </Field>

            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
              <Input id="email" type="email" placeholder="admin@estancia360.com" aria-invalid={!!errors.email} {...register("email")} />
              <FieldError errors={[errors.email]} />
            </Field>

            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="password">Contraseña</FieldLabel>
              <Input id="password" type="password" placeholder="••••••••" aria-invalid={!!errors.password} {...register("password")} />
              <FieldError errors={[errors.password]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="celphone">Celular (opcional)</FieldLabel>
              <Input id="celphone" placeholder="78945612" {...register("celphone")} />
            </Field>
          </FieldGroup>

          <DialogFooter className="mt-6">
            <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Spinner data-icon="inline-start" /> : null}
              Crear administrador
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
