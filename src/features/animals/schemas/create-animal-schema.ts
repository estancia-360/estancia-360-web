import { z } from "zod";

export const createAnimalSchema = z.object({
  code: z.string().min(1, "El código es obligatorio").max(50, "El código es demasiado largo"),
  sex: z.enum(["F", "M"], { message: "Elegí el sexo del animal" }),
  idBreed: z.coerce.number().int().positive("Elegí una raza"),
  idAnimalClass: z.coerce.number().int().positive("Elegí una clase"),
  birthdate: z.string().min(1, "La fecha de nacimiento es obligatoria"),
  idProductiveStatus: z.coerce.number().int().positive("Elegí una etapa productiva"),
  idLot: z.coerce.number().int().positive().optional(),
  weight: z.coerce.number().positive("El peso debe ser mayor a 0").optional(),
  origin: z.string().optional(),
  codeMother: z.string().optional(),
  codeFather: z.string().optional(),
});

export type CreateAnimalValues = z.infer<typeof createAnimalSchema>;
