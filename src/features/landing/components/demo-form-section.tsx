import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";
import { AnimateIn } from "@/components/layout/animate-in";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  demoRequestSchema,
  departmentOptions,
  herdSizeOptions,
  type DemoRequestValues,
} from "@/features/landing/schemas/demo-request-schema";

const demoHighlights = [
  "Sin costo, sin compromiso",
  "Demo personalizada a tu operación",
  "Respuesta en menos de 24 horas",
];

export function DemoFormSection() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DemoRequestValues>({
    resolver: zodResolver(demoRequestSchema),
    defaultValues: { fullName: "", ranchName: "", department: "", phone: "", email: "", herdSize: "" },
  });

  const onSubmit = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsSubmitted(true);
  };

  return (
    <section id="demo" className="bg-white py-[clamp(64px,8vw,120px)]">
      <Container className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <AnimateIn direction="right">
          <SectionHeading
            label="Solicita tu demo"
            title={
              <>
                Solicita una
                <br />
                demostración
              </>
            }
            description="Déjanos tus datos y uno de nuestros asesores se comunicará contigo para mostrarte cómo Estancia360 puede transformar tu operación."
          />
          <ul className="flex flex-col gap-3">
            {demoHighlights.map((highlight) => (
              <li key={highlight} className="flex items-center gap-2.5 text-sm font-medium text-brand-text-mid">
                <CheckCircle2 className="size-4 text-brand-green" strokeWidth={3} />
                {highlight}
              </li>
            ))}
          </ul>
        </AnimateIn>

        <AnimateIn direction="left">
          <div className="rounded-[24px] border border-brand-blue/6 bg-white p-7 shadow-[0_12px_40px_rgba(0,0,0,0.08)] sm:p-9">
            {isSubmitted ? (
              <div className="flex flex-col items-center py-8 text-center" aria-live="polite">
                <CheckCircle2 className="mb-4 size-12 text-brand-green" strokeWidth={1.5} />
                <h3 className="mb-2 font-heading text-xl font-bold text-brand-blue">¡Solicitud recibida!</h3>
                <p className="text-sm leading-relaxed text-brand-text-muted">
                  Gracias por tu interés en Estancia360. Uno de nuestros asesores se comunicará contigo en las
                  próximas 24 horas.
                </p>
              </div>
            ) : (
              <form
                noValidate
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-5"
                aria-label="Formulario de solicitud de demostración"
              >
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="fullName">Nombre completo *</Label>
                    <Input id="fullName" placeholder="Tu nombre" autoComplete="name" {...register("fullName")} />
                    {errors.fullName ? (
                      <span className="text-xs text-red-600">{errors.fullName.message}</span>
                    ) : null}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="ranchName">Empresa o Estancia *</Label>
                    <Input id="ranchName" placeholder="Nombre de tu estancia" {...register("ranchName")} />
                    {errors.ranchName ? (
                      <span className="text-xs text-red-600">{errors.ranchName.message}</span>
                    ) : null}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="department">Departamento *</Label>
                    <Controller
                      control={control}
                      name="department"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger id="department" className="w-full">
                            <SelectValue placeholder="Selecciona tu departamento" />
                          </SelectTrigger>
                          <SelectContent>
                            {departmentOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.department ? (
                      <span className="text-xs text-red-600">{errors.department.message}</span>
                    ) : null}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="phone">Teléfono *</Label>
                    <Input id="phone" placeholder="+591 7XX XXX XXX" autoComplete="tel" {...register("phone")} />
                    {errors.phone ? <span className="text-xs text-red-600">{errors.phone.message}</span> : null}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="email">Correo electrónico *</Label>
                  <Input id="email" type="email" placeholder="tu@correo.com" autoComplete="email" {...register("email")} />
                  {errors.email ? <span className="text-xs text-red-600">{errors.email.message}</span> : null}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="herdSize">Cantidad aproximada de animales *</Label>
                  <Controller
                    control={control}
                    name="herdSize"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="herdSize" className="w-full">
                          <SelectValue placeholder="Selecciona un rango" />
                        </SelectTrigger>
                        <SelectContent>
                          {herdSizeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.herdSize ? <span className="text-xs text-red-600">{errors.herdSize.message}</span> : null}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-12 w-full rounded-full bg-brand-green text-base font-semibold text-white hover:bg-brand-green-light"
                >
                  {isSubmitting ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}
                  {isSubmitting ? "Enviando..." : "Quiero una demostración"}
                </Button>

                <p className="text-center text-xs leading-relaxed text-brand-text-muted">
                  Al enviar este formulario aceptas nuestra{" "}
                  <a href="#" className="text-brand-green underline-offset-2 hover:underline">
                    política de privacidad
                  </a>
                  . Tus datos están seguros con nosotros.
                </p>
              </form>
            )}
          </div>
        </AnimateIn>
      </Container>
    </section>
  );
}
