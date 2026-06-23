import { z } from "zod";

export const departmentOptions = [
  { value: "santa-cruz", label: "Santa Cruz" },
  { value: "beni", label: "Beni" },
  { value: "cochabamba", label: "Cochabamba" },
  { value: "la-paz", label: "La Paz" },
  { value: "tarija", label: "Tarija" },
  { value: "pando", label: "Pando" },
  { value: "oruro", label: "Oruro" },
  { value: "potosi", label: "Potosí" },
  { value: "chuquisaca", label: "Chuquisaca" },
] as const;

export const herdSizeOptions = [
  { value: "menos-100", label: "Menos de 100" },
  { value: "100-500", label: "100 – 500" },
  { value: "500-1000", label: "500 – 1.000" },
  { value: "1000-3000", label: "1.000 – 3.000" },
  { value: "3000-plus", label: "Más de 3.000" },
] as const;

const phoneRegex = /^\d{7,15}$/;

export const demoRequestSchema = z.object({
  fullName: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres."),
  ranchName: z.string().trim().min(1, "Por favor ingresa el nombre de tu estancia."),
  department: z.string().min(1, "Por favor selecciona tu departamento."),
  phone: z
    .string()
    .trim()
    .min(1, "Por favor ingresa tu teléfono.")
    .refine((value) => phoneRegex.test(value.replace(/[\s\-()+]/g, "")), {
      message: "Ingresa un número de teléfono válido.",
    }),
  email: z.string().trim().min(1, "Por favor ingresa tu correo.").email("Ingresa un correo electrónico válido."),
  herdSize: z.string().min(1, "Por favor selecciona la cantidad aproximada de animales."),
});

export type DemoRequestValues = z.infer<typeof demoRequestSchema>;
