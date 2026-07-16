import { useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn } from "lucide-react";
import { toast } from "sonner";
import { Container } from "@/components/layout/container";
import { BrandLogo, BrandWordmark } from "@/features/landing/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/features/auth/context/use-auth";
import { loginSchema, type LoginValues } from "@/features/auth/schemas/login-schema";
import { isAdminRole } from "@/features/auth/lib/roles";
import { ApiError } from "@/lib/api-client";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginValues) => {
    setFormError(null);
    try {
      const session = await login(values.email, values.password);
      toast.success("Ingreso exitoso");
      navigate(isAdminRole(session.idRole) ? "/admin" : "/dashboard", { replace: true });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "No se pudo iniciar sesión. Intentá de nuevo.";
      setFormError(message);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-cream px-5 py-16">
      <Container className="flex max-w-md flex-col items-center">
        <a href="/" className="mb-8 flex items-center gap-2.5" aria-label="Estancia360 inicio">
          <BrandLogo />
          <BrandWordmark />
        </a>

        <div className="w-full rounded-[24px] border border-brand-blue/6 bg-white p-7 shadow-[0_12px_40px_rgba(0,0,0,0.08)] sm:p-9">
          <div className="mb-6 flex flex-col gap-1.5 text-center">
            <h1 className="font-heading text-xl font-bold text-brand-blue">Ingresar</h1>
            <p className="text-sm text-brand-text-muted">Accedé con tu cuenta de Estancia360</p>
          </div>

          <form noValidate onSubmit={handleSubmit(onSubmit)} aria-label="Formulario de ingreso">
            <FieldGroup>
              {formError ? (
                <Alert variant="destructive">
                  <AlertTitle>{formError}</AlertTitle>
                </Alert>
              ) : null}

              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@correo.com"
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  {...register("email")}
                />
                <FieldError errors={[errors.email]} />
              </Field>

              <Field data-invalid={!!errors.password}>
                <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  aria-invalid={!!errors.password}
                  {...register("password")}
                />
                <FieldError errors={[errors.password]} />
              </Field>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-11 w-full rounded-full bg-brand-green text-base font-semibold text-white hover:bg-brand-green-light"
              >
                {isSubmitting ? <Spinner data-icon="inline-start" /> : <LogIn data-icon="inline-start" />}
                {isSubmitting ? "Ingresando..." : "Ingresar"}
              </Button>
            </FieldGroup>
          </form>
        </div>
      </Container>
    </main>
  );
}
