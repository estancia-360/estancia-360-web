import { z } from "zod";
import { optionalNumber } from "@/lib/zod-helpers";

export const purchaseSchema = z.object({
  code: z.string().min(1, "El código es obligatorio").max(50, "El código es demasiado largo"),
  sex: z.enum(["F", "M"], { message: "Elegí el sexo del animal" }),
  idBreed: z.coerce.number().int().positive("Elegí una raza"),
  idAnimalClass: z.coerce.number().int().positive("Elegí una clase"),
  birthdate: z.string().min(1, "La fecha de nacimiento es obligatoria"),
  weight: optionalNumber(z.number().positive("El peso debe ser mayor a 0")),
  idLot: z.coerce.number().int().positive().optional(),
  idProductiveStatus: z.coerce.number().int().min(1).max(3).optional(),
  originName: z.string().max(200, "Demasiado largo").optional(),
  totalPrice: optionalNumber(z.number().positive("Debe ser mayor a 0")),
  pricePerKg: optionalNumber(z.number().positive("Debe ser mayor a 0")),
  notes: z.string().optional(),
  movementDate: z.string().min(1, "La fecha es obligatoria"),
});

export type PurchaseValues = z.infer<typeof purchaseSchema>;
