import { z } from "zod";

export const lotSchema = z.object({
  idRanchPasture: z.coerce.number().int().positive("Elegí un potrero"),
  name: z.string().min(1, "El nombre es obligatorio").max(50, "El nombre es demasiado largo"),
  lotType: z.enum(["cria", "recria", "engorde", "reproductiva", "general"], { message: "Elegí el tipo de lote" }),
  capacity: z.coerce.number().int().positive("La capacidad debe ser mayor a 0").optional(),
});

export type LotValues = z.infer<typeof lotSchema>;
