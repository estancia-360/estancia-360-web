import { z } from "zod";
import { optionalNumber } from "@/lib/zod-helpers";

export const weightRecordSchema = z.object({
  idLot: z.coerce.number().int().positive("Elegí un lote"),
  weight: z.coerce.number().positive("El peso debe ser mayor a 0"),
  weightType: z.enum(["scale", "estimated"], { message: "Elegí cómo se tomó el peso" }),
  bodyCondition: optionalNumber(z.number().int().min(1, "Entre 1 y 5").max(5, "Entre 1 y 5")),
  ageDays: optionalNumber(z.number().int().positive("Debe ser mayor a 0")),
  notes: z.string().optional(),
  eventDate: z.string().min(1, "La fecha es obligatoria"),
});

export type WeightRecordValues = z.infer<typeof weightRecordSchema>;
