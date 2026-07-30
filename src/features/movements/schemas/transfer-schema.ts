import { z } from "zod";

export const transferSchema = z.object({
  animalIds: z.array(z.number()).min(1, "Elegí al menos un animal"),
  idLotDest: z.coerce.number().int().positive("Elegí el lote de destino"),
  notes: z.string().optional(),
  movementDate: z.string().min(1, "La fecha es obligatoria"),
});

export type TransferValues = z.infer<typeof transferSchema>;
