import { z } from "zod";

export const animalExitSchema = z
  .object({
    idRanchAnimal: z.coerce.number().int().positive("Elegí el animal"),
    reason: z.enum(["death", "discard", "loss", "other"], { message: "Elegí el motivo" }),
    notes: z.string().optional(),
    eventDate: z.string().min(1, "La fecha es obligatoria"),
  })
  .refine((data) => data.reason !== "other" || !!data.notes, {
    message: "Contá el motivo en notas cuando elegís \"Otro\"",
    path: ["notes"],
  });

export type AnimalExitValues = z.infer<typeof animalExitSchema>;
