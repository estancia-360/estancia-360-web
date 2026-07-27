import { z } from "zod";

export const registerBreedingServiceSchema = z
  .object({
    idRanchAnimal: z.coerce.number().int().positive("Elegí la hembra"),
    serviceType: z.enum(["natural", "artificial_insemination", "embryo_transfer"], { message: "Elegí el tipo de servicio" }),
    idAnimalMale: z.coerce.number().int().positive().optional(),
    semenBreed: z.string().optional(),
    technician: z.string().optional(),
    reproductiveLot: z.string().optional(),
    eventDate: z.string().min(1, "La fecha es obligatoria"),
  })
  .refine((data) => data.serviceType !== "natural" || !!data.idAnimalMale, {
    message: "La monta natural requiere elegir el macho",
    path: ["idAnimalMale"],
  });

export type RegisterBreedingServiceValues = z.infer<typeof registerBreedingServiceSchema>;
