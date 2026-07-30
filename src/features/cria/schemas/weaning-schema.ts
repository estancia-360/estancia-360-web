import { z } from "zod";
import { optionalNumber } from "@/lib/zod-helpers";

export const weaningSchema = z.object({
  idLotDest: z.coerce.number().int().positive("Elegí el lote de destino"),
  weaningWeight: optionalNumber(z.number().positive("El peso debe ser mayor a 0")),
  weaningAge: optionalNumber(z.number().int().min(1, "Entre 1 y 730 días").max(730, "Entre 1 y 730 días")),
  notes: z.string().optional(),
  eventDate: z.string().min(1, "La fecha es obligatoria"),
});

export type WeaningValues = z.infer<typeof weaningSchema>;
