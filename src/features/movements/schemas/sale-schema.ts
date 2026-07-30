import { z } from "zod";
import { optionalNumber } from "@/lib/zod-helpers";

export const saleSchema = z.object({
  animalIds: z.array(z.number()).min(1, "Elegí al menos un animal"),
  counterpartName: z.string().min(1, "El nombre del comprador es obligatorio").max(200, "Demasiado largo"),
  totalPrice: optionalNumber(z.number().positive("Debe ser mayor a 0")),
  pricePerKg: optionalNumber(z.number().positive("Debe ser mayor a 0")),
  notes: z.string().optional(),
  movementDate: z.string().min(1, "La fecha es obligatoria"),
});

export type SaleValues = z.infer<typeof saleSchema>;
