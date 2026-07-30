import { z } from "zod";

export const pastureSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(100, "El nombre es demasiado largo"),
  areaHectares: z.coerce.number().positive("La superficie debe ser mayor a 0"),
  description: z.string().optional(),
});

export type PastureValues = z.infer<typeof pastureSchema>;
