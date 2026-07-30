import { z } from "zod";

export const vaccinationSchema = z.object({
  vaccineName: z.string().min(1, "El nombre de la vacuna es obligatorio").max(150, "Demasiado largo"),
  dose: z.string().optional(),
  responsible: z.string().optional(),
  notes: z.string().optional(),
  eventDate: z.string().min(1, "La fecha es obligatoria"),
});

export type VaccinationValues = z.infer<typeof vaccinationSchema>;
