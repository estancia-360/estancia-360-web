import type { BulkImportCatalogs } from "../catalogs";
import { cellText, parseExcelDate, parseNumber, pickSheetRows, readWorkbookFromFile } from "../parse-helpers";
import { normalizeText } from "../parse-helpers";
import type { ImportSection, ParsedRow } from "../../types";

export async function parseWeightsFile(file: File, catalogs: BulkImportCatalogs): Promise<ImportSection[]> {
  const workbook = await readWorkbookFromFile(file);
  const rawRows = pickSheetRows(workbook, "Registro Pesajes");

  const rows: ParsedRow[] = rawRows.map((r, i) => {
    const errors: string[] = [];
    const code = cellText(r[0]);
    const eventDate = parseExcelDate(r[1]);
    const weight = parseNumber(r[2]);
    const bodyCondition = parseNumber(r[3]);
    const notes = cellText(r[4]);

    const animal = code ? catalogs.animalsByCode.get(normalizeText(code)) : null;
    if (!code) errors.push("Código vacío");
    else if (!animal) errors.push(`Animal "${code}" no encontrado en la estancia`);
    else if (!animal.idLot) errors.push(`El animal "${code}" no está asignado a ningún lote — asignalo desde Potreros antes de importar el pesaje`);

    if (!eventDate) errors.push(`Fecha inválida: "${r[1] ?? ""}"`);
    if (weight === null || weight <= 0) errors.push(`Peso inválido: "${r[2] ?? ""}"`);

    return {
      rowIndex: i + 1,
      label: code ?? `fila ${i + 2}`,
      errors,
      hasError: errors.length > 0,
      preview: {
        Código: code ?? "",
        Fecha: eventDate ?? "",
        "Peso (kg)": weight !== null ? String(weight) : "",
        "Cond. corporal": bodyCondition !== null ? String(bodyCondition) : "",
        Lote: animal?.idLot ? String(animal.idLot) : "",
      },
      payload: {
        rowIndex: i + 1,
        idRanchAnimal: animal?.id,
        idLot: animal?.idLot ?? undefined,
        weight: weight ?? undefined,
        weightType: "scale",
        bodyCondition: bodyCondition ?? undefined,
        notes: notes ?? undefined,
        eventDate: eventDate ? new Date(eventDate).toISOString() : undefined,
      },
    };
  });

  return [{ key: "weights", label: "Pesajes", rows }];
}
