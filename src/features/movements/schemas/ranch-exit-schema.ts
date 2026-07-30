import { z } from "zod";

export const ranchExitSchema = z.object({
  animalIds: z.array(z.number()).min(1, "Elegí al menos un animal"),
  counterpartName: z.string().min(1, "El nombre de la estancia destino es obligatorio").max(200, "Demasiado largo"),
  notes: z.string().optional(),
  movementDate: z.string().min(1, "La fecha es obligatoria"),
});

export type RanchExitValues = z.infer<typeof ranchExitSchema>;
