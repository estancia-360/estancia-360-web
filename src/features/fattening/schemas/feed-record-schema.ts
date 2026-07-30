import { z } from "zod";
import { optionalNumber } from "@/lib/zod-helpers";

export const feedRecordSchema = z.object({
  feedDate: z.string().min(1, "La fecha es obligatoria"),
  feedType: z.string().min(1, "El tipo de alimento es obligatorio").max(150, "Demasiado largo"),
  quantity: optionalNumber(z.number().positive("La cantidad debe ser mayor a 0")),
  unit: z.string().max(20, "Demasiado largo").optional(),
  cost: optionalNumber(z.number().min(0, "El costo no puede ser negativo")),
  notes: z.string().optional(),
});

export type FeedRecordValues = z.infer<typeof feedRecordSchema>;
