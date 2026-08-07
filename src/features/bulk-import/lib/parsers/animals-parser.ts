import type { BulkImportCatalogs } from "../catalogs";
import { matchAnimalClass, matchBreed } from "../class-breed-match";
import { cellText, parseExcelDate, parseNumber, pickSheetRows, readWorkbookFromFile } from "../parse-helpers";
import { fuzzyMatchByName } from "../catalogs";
import { ANIMAL_STATUS_IDS } from "@/features/animals/types";
import type { ImportSection, ParsedRow } from "../../types";

function mapSex(raw: unknown): "F" | "M" | null {
  const s = cellText(raw)?.toUpperCase();
  if (!s) return null;
  if (s.startsWith("H") || s === "F" || s === "FEMENINO") return "F";
  if (s.startsWith("M")) return "M";
  return null;
}

export async function parseAnimalsFile(file: File, catalogs: BulkImportCatalogs): Promise<ImportSection[]> {
  const workbook = await readWorkbookFromFile(file);
  const rawRows = pickSheetRows(workbook, "Alta Inventario");

  const rows: ParsedRow[] = rawRows.map((r, i) => {
    const errors: string[] = [];
    const code = cellText(r[0]);
    const sex = mapSex(r[1]);
    const categoryLabel = cellText(r[2]);
    const breedLabel = cellText(r[3]);
    const birthdate = parseExcelDate(r[4]);
    const lotLabel = cellText(r[6]);
    const weight = parseNumber(r[7]);

    if (!code) errors.push("Código vacío");
    if (!sex) errors.push(`Sexo "${r[1] ?? ""}" no reconocido`);
    if (!birthdate) errors.push(`Fecha de nacimiento inválida: "${r[4] ?? ""}"`);

    const animalClass = matchAnimalClass(categoryLabel, sex, catalogs.classes);
    if (!animalClass) errors.push(`Categoría "${categoryLabel ?? ""}" no reconocida`);

    const breed = matchBreed(breedLabel, catalogs.breeds);
    if (!breed) errors.push(`Raza "${breedLabel ?? ""}" no reconocida`);

    const lot = lotLabel ? fuzzyMatchByName(catalogs.lotsByName, lotLabel) : null;
    if (lotLabel && !lot) errors.push(`Lote "${lotLabel}" no encontrado`);

    if (code && catalogs.animalsByCode.has(code.toUpperCase())) errors.push(`Ya existe un animal con código "${code}" en la estancia`);

    return {
      rowIndex: i + 1,
      label: code ?? `fila ${i + 2}`,
      errors,
      hasError: errors.length > 0,
      preview: {
        Código: code ?? "",
        Sexo: sex ?? String(r[1] ?? ""),
        Categoría: categoryLabel ?? "",
        Raza: breedLabel ?? "",
        Nacimiento: birthdate ?? "",
        Lote: lotLabel ?? "",
        Peso: weight !== null ? String(weight) : "",
      },
      payload: {
        rowIndex: i + 1,
        code,
        sex,
        idAnimalClass: animalClass?.id,
        idBreed: breed?.id,
        idStatus: ANIMAL_STATUS_IDS.ACTIVE,
        birthdate,
        idLot: lot?.id,
        weight: weight ?? undefined,
        createdAt: new Date().toISOString(),
      },
    };
  });

  return [{ key: "animals", label: "Animales", rows }];
}
