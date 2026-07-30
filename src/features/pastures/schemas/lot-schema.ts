import { z } from "zod";
import { optionalNumber } from "@/lib/zod-helpers";

export const lotSchema = z.object({
  idRanchPasture: z.coerce.number().int().positive("Elegí un potrero"),
  name: z.string().min(1, "El nombre es obligatorio").max(50, "El nombre es demasiado largo"),
  lotType: z.enum(["cria", "recria", "engorde", "reproductiva", "general"], { message: "Elegí el tipo de lote" }),
  capacity: optionalNumber(z.number().int().positive("La capacidad debe ser mayor a 0")),
});

export type LotValues = z.infer<typeof lotSchema>;
