import { z } from "zod";
import { optionalNumber } from "@/lib/zod-helpers";

export const fatteningEntrySchema = z.object({
  idRanchAnimal: z.coerce.number().int().positive("Elegí el animal"),
  idLotDest: z.coerce.number().int().positive("Elegí el lote de engorde"),
  systemType: z.enum(["field", "feedlot"], { message: "Elegí el sistema" }),
  initialWeight: optionalNumber(z.number().positive("El peso debe ser mayor a 0")),
  notes: z.string().optional(),
  eventDate: z.string().min(1, "La fecha es obligatoria"),
});

export type FatteningEntryValues = z.infer<typeof fatteningEntrySchema>;
