import { z } from "zod";
import { optionalNumber } from "@/lib/zod-helpers";

export const parturitionSchema = z
  .object({
    birthType: z.enum(["normal", "assisted", "cesarean"], { message: "Elegí el tipo de parto" }),
    criaStatus: z.enum(["alive", "dead"], { message: "Elegí el estado de la cría" }),
    criaWeight: optionalNumber(z.number().positive("El peso debe ser mayor a 0")),
    motherCondition: z.enum(["good", "regular", "bad"]).optional(),
    criaCode: z.string().optional(),
    criaIdBreed: z.coerce.number().int().positive().optional(),
    criaIdAnimalClass: z.coerce.number().int().positive().optional(),
    criaSex: z.enum(["F", "M"]).optional(),
    notes: z.string().optional(),
    eventDate: z.string().min(1, "La fecha es obligatoria"),
  })
  .refine((data) => data.criaStatus !== "alive" || !!data.criaCode, {
    message: "El código de la cría es obligatorio",
    path: ["criaCode"],
  })
  .refine((data) => data.criaStatus !== "alive" || !!data.criaIdBreed, {
    message: "Elegí la raza de la cría",
    path: ["criaIdBreed"],
  })
  .refine((data) => data.criaStatus !== "alive" || !!data.criaIdAnimalClass, {
    message: "Elegí la clase de la cría",
    path: ["criaIdAnimalClass"],
  })
  .refine((data) => data.criaStatus !== "alive" || !!data.criaSex, {
    message: "Elegí el sexo de la cría",
    path: ["criaSex"],
  });

export type ParturitionValues = z.infer<typeof parturitionSchema>;
