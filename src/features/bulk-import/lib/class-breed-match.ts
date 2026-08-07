import type { AnimalClass, AnimalBreed } from "@/features/animals/types";
import { normalizeText } from "./parse-helpers";

/**
 * Los nombres de categoría del template de referencia (13 etiquetas descriptivas, ej. "Torete
 * (macho entero joven)") no coinciden 1:1 con las 11 clases fijas del catálogo real
 * (AnimalClassEnum, CLAUDE.md) — son un vocabulario de campo más granular. Match exacto/substring
 * primero; si no hay match razonable, la fila queda en error en vez de adivinar en silencio
 * (una clase mal asignada es un dato productivo incorrecto, no algo para corregir después).
 * Palabras clave de respaldo para los casos más comunes de la plantilla real.
 */
const CLASS_KEYWORD_HINTS: { keywords: string[]; sex?: "F" | "M"; classNameContains: string }[] = [
  { keywords: ["LACTANTE", "TERNERO", "TERNERA"], sex: "F", classNameContains: "TERNERA" },
  { keywords: ["LACTANTE", "TERNERO", "TERNERA"], sex: "M", classNameContains: "TERNERO MACHO ENTERO" },
  { keywords: ["DESTETADO"], sex: "F", classNameContains: "HEMBRA DESTETADA" },
  { keywords: ["DESTETADO"], sex: "M", classNameContains: "MACHO ENTERO DESTETADO" },
  { keywords: ["VAQUILLA", "VAQUILLONA", "NULIPARA"], classNameContains: "VAQUILLA" },
  { keywords: ["VACA"], classNameContains: "VACA" },
  { keywords: ["TORETE", "TORILLO", "TORO", "SEMENTAL"], classNameContains: "TORILLO" },
  { keywords: ["NOVILLITO", "NOVILLO", "TORUNO"], classNameContains: "NOVILLO" },
];

export function matchAnimalClass(rawLabel: string | null, sex: "F" | "M" | null, classes: AnimalClass[]): AnimalClass | null {
  if (!rawLabel) return null;
  const needle = normalizeText(rawLabel);

  const exact = classes.find((c) => normalizeText(c.name) === needle);
  if (exact) return exact;

  const bySex = sex ? classes.filter((c) => c.sex === sex) : classes;
  const substring = bySex.find((c) => needle.includes(normalizeText(c.name)) || normalizeText(c.name).includes(needle));
  if (substring) return substring;

  for (const hint of CLASS_KEYWORD_HINTS) {
    if (hint.sex && hint.sex !== sex) continue;
    if (!hint.keywords.some((kw) => needle.includes(kw))) continue;
    const match = bySex.find((c) => normalizeText(c.name).includes(hint.classNameContains));
    if (match) return match;
  }

  return null;
}

export function matchBreed(rawLabel: string | null, breeds: AnimalBreed[]): AnimalBreed | null {
  if (!rawLabel) return null;
  const needle = normalizeText(rawLabel);

  const exact = breeds.find((b) => normalizeText(b.name) === needle);
  if (exact) return exact;

  return breeds.find((b) => needle.includes(normalizeText(b.name)) || normalizeText(b.name).includes(needle)) ?? null;
}
