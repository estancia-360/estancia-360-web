import { z } from "zod";

/**
 * Envuelve un schema de número opcional para que un input vacío ("", como
 * llega de un <Input type="number"> sin tocar via react-hook-form) se trate
 * como "no se cargó" en vez de coercionarse a 0 y fallar un .min(1)/.positive().
 * z.coerce.number() por sí solo no distingue "vacío" de "cero".
 */
export function optionalNumber<T extends z.ZodNumber>(schema: T) {
  return z.preprocess((value) => (value === "" || value === undefined || value === null ? undefined : value), schema.optional());
}
