import { z } from "zod";

export const registerPaymentSchema = z.object({
  amount: z.coerce.number().positive("El monto debe ser mayor a 0"),
  paymentDate: z.string().min(1, "La fecha es obligatoria"),
  paymentMethod: z.enum(["qr", "transfer"], { message: "Seleccioná un método de pago" }),
  periodExtendedMonths: z.coerce.number().int().positive("Debe ser un número entero mayor a 0"),
  externalReference: z.string().optional(),
  notes: z.string().optional(),
});

export type RegisterPaymentValues = z.infer<typeof registerPaymentSchema>;
