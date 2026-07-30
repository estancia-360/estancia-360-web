import { z } from "zod";
import { optionalNumber } from "@/lib/zod-helpers";

export const rearingSelectionSchema = z
  .object({
    destination: z.enum(["replacement", "fattening", "sale"], { message: "Elegí el destino" }),
    idLotDest: z.coerce.number().int().positive().optional(),
    systemType: z.enum(["field", "feedlot"]).optional(),
    weightAtSelection: optionalNumber(z.number().positive("El peso debe ser mayor a 0")),
    bodyCondition: optionalNumber(z.number().int().min(1, "Entre 1 y 5").max(5, "Entre 1 y 5")),
    geneticScore: optionalNumber(z.number().min(0, "Entre 0 y 10").max(10, "Entre 0 y 10")),
    notes: z.string().optional(),
    eventDate: z.string().min(1, "La fecha es obligatoria"),
  })
  .refine((data) => data.destination !== "fattening" || !!data.idLotDest, {
    message: "Elegí el lote de destino en engorde",
    path: ["idLotDest"],
  })
  .refine((data) => data.destination !== "fattening" || !!data.systemType, {
    message: "Elegí el sistema de engorde",
    path: ["systemType"],
  });

export type RearingSelectionValues = z.infer<typeof rearingSelectionSchema>;
