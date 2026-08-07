import type { BulkImportCatalogs } from "../catalogs";
import { cellText, normalizeText, parseExcelDate, parseNumber, pickSheetRows, readWorkbookFromFile } from "../parse-helpers";
import type { ImportSection, ParsedRow } from "../../types";

function mapDiagnosisResult(raw: unknown): "pregnant" | "empty" | null {
  const s = normalizeText(raw);
  if (!s) return null;
  if (s.includes("PREN") || s.includes("POSITIV")) return "pregnant";
  if (s.includes("VAC") || s.includes("NEGATIV")) return "empty";
  return null;
}

export async function parseGestationFile(file: File, catalogs: BulkImportCatalogs): Promise<ImportSection[]> {
  const workbook = await readWorkbookFromFile(file);
  const rawRows = pickSheetRows(workbook, "Registro Tactos");

  const rows: ParsedRow[] = rawRows.map((r, i) => {
    const errors: string[] = [];
    const code = cellText(r[0]);
    const eventDate = parseExcelDate(r[1]);
    const result = mapDiagnosisResult(r[3]);
    const months = parseNumber(r[4]);
    const gestationDays = months !== null ? Math.round(months * 30) : null;
    const notes = cellText(r[7]);

    const animal = code ? catalogs.animalsByCode.get(normalizeText(code)) : null;
    if (!code) errors.push("Código vacío");
    else if (!animal) errors.push(`Animal "${code}" no encontrado en la estancia`);

    if (!eventDate) errors.push(`Fecha de tacto inválida: "${r[1] ?? ""}"`);
    if (!result) errors.push(`Diagnóstico "${r[3] ?? ""}" no reconocido (usar Preñada/Vacía)`);
    if (result === "pregnant" && gestationDays === null) errors.push("Meses de gestación obligatorio cuando el diagnóstico es Preñada");

    return {
      rowIndex: i + 1,
      label: code ?? `fila ${i + 2}`,
      errors,
      hasError: errors.length > 0,
      preview: {
        Código: code ?? "",
        Fecha: eventDate ?? "",
        Diagnóstico: result === "pregnant" ? "Preñada" : result === "empty" ? "Vacía" : String(r[3] ?? ""),
        "Días gestación": gestationDays !== null ? String(gestationDays) : "",
      },
      payload: {
        rowIndex: i + 1,
        idRanchAnimal: animal?.id,
        method: "palpation",
        result: result ?? undefined,
        gestationDays: gestationDays ?? undefined,
        notes: notes ?? undefined,
        eventDate: eventDate ? new Date(eventDate).toISOString() : undefined,
      },
    };
  });

  return [{ key: "gestation", label: "Diagnósticos de gestación", rows }];
}
