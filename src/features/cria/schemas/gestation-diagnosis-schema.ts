import { z } from "zod";
import { optionalNumber } from "@/lib/zod-helpers";

export const gestationDiagnosisSchema = z.object({
  method: z.enum(["palpation", "ultrasound"], { message: "Elegí el método" }),
  result: z.enum(["pregnant", "empty"], { message: "Elegí el resultado" }),
  gestationDays: optionalNumber(z.number().int().min(1, "Entre 1 y 300 días").max(300, "Entre 1 y 300 días")),
  estimatedBirth: z.string().optional(),
  veterinarian: z.string().optional(),
  notes: z.string().optional(),
  eventDate: z.string().min(1, "La fecha es obligatoria"),
});

export type GestationDiagnosisValues = z.infer<typeof gestationDiagnosisSchema>;
