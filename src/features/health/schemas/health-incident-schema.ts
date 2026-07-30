import { z } from "zod";

export const healthIncidentSchema = z.object({
  incidentType: z.enum(["illness_detected", "quarantine"], { message: "Elegí el tipo de incidente" }),
  description: z.string().optional(),
  notes: z.string().optional(),
  eventDate: z.string().min(1, "La fecha es obligatoria"),
});

export type HealthIncidentValues = z.infer<typeof healthIncidentSchema>;
