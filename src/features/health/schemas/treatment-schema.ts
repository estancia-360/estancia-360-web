import { z } from "zod";
import { optionalNumber } from "@/lib/zod-helpers";

export const treatmentSchema = z.object({
  illness: z.string().optional(),
  medication: z.string().min(1, "El medicamento es obligatorio").max(150, "Demasiado largo"),
  dose: z.string().optional(),
  durationDays: optionalNumber(z.number().int().positive("Debe ser mayor a 0")),
  withdrawalDays: optionalNumber(z.number().int().positive("Debe ser mayor a 0")),
  responsible: z.string().optional(),
  notes: z.string().optional(),
  eventDate: z.string().min(1, "La fecha es obligatoria"),
});

export type TreatmentValues = z.infer<typeof treatmentSchema>;
