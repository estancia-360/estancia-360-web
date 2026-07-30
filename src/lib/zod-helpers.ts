import { z } from "zod";

/**
 * Envuelve un schema de número opcional para que un input vacío ("", como
 * llega de un <Input type="number"> sin tocar via react-hook-form) se trate
 * como "no se cargó" en vez de coercionarse a 0 y fallar un .min(1)/.positive().
 * z.coerce.number() por sí solo no distingue "vacío" de "cero". El schema
 * base NO es coerce (z.number() puro) porque acá se hace la coerción a mano
 * después de descartar el caso vacío — si tuviera cero un valor cargado
 * (ej. "35") llegaría como string y z.number() lo rechazaría sin esto.
 */
export function optionalNumber<T extends z.ZodNumber>(schema: T) {
  return z.preprocess((value) => {
    if (value === "" || value === undefined || value === null) return undefined;
    return typeof value === "string" ? Number(value) : value;
  }, schema.optional());
}
