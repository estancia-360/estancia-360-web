import type { BulkImportCatalogs } from "../catalogs";
import { cellText, normalizeText, parseExcelDate, parseNumber, pickSheetRows, readWorkbookFromFile } from "../parse-helpers";
import type { ImportSection, ParsedRow } from "../../types";

function resolveAnimal(catalogs: BulkImportCatalogs, code: string | null) {
  return code ? catalogs.animalsByCode.get(normalizeText(code)) : null;
}

function parseVaccinations(rawRows: unknown[][], catalogs: BulkImportCatalogs): ParsedRow[] {
  const rows: ParsedRow[] = [];
  let counter = 0;

  for (const r of rawRows) {
    const code = cellText(r[2]);
    const eventDate = parseExcelDate(r[1]);
    const responsible = cellText(r[12]);
    const notes = cellText(r[13]);
    const animal = resolveAnimal(catalogs, code);

    const products: { name: string; dose: string | null }[] = [];
    for (const [nameIdx, doseIdx] of [
      [4, 5],
      [6, 7],
      [8, 9],
      [10, 11],
    ] as const) {
      const name = cellText(r[nameIdx]);
      if (name) products.push({ name, dose: cellText(r[doseIdx]) });
    }

    if (products.length === 0) {
      counter += 1;
      rows.push({
        rowIndex: counter,
        label: code ?? `fila`,
        errors: ["No hay ninguna vacuna cargada en esta fila (VACUNA_1..4 vacías)"],
        hasError: true,
        preview: { Código: code ?? "", Fecha: eventDate ?? "", Vacuna: "" },
        payload: { rowIndex: counter },
      });
      continue;
    }

    for (const product of products) {
      counter += 1;
      const errors: string[] = [];
      if (!code) errors.push("Código vacío");
      else if (!animal) errors.push(`Animal "${code}" no encontrado en la estancia`);
      if (!eventDate) errors.push(`Fecha inválida: "${r[1] ?? ""}"`);

      rows.push({
        rowIndex: counter,
        label: `${code ?? "?"} · ${product.name}`,
        errors,
        hasError: errors.length > 0,
        preview: { Código: code ?? "", Fecha: eventDate ?? "", Vacuna: product.name, Dosis: product.dose ?? "" },
        payload: {
          rowIndex: counter,
          idRanchAnimal: animal?.id,
          vaccineName: product.name,
          dose: product.dose ?? undefined,
          responsible: responsible ?? undefined,
          notes: notes ?? undefined,
          eventDate: eventDate ? new Date(eventDate).toISOString() : undefined,
        },
      });
    }
  }

  return rows;
}

function parseTreatments(rawRows: unknown[][], catalogs: BulkImportCatalogs): ParsedRow[] {
  return rawRows.map((r, i) => {
    const errors: string[] = [];
    const code = cellText(r[2]);
    const eventDate = parseExcelDate(r[1]);
    const illness = cellText(r[4]);
    const medication = cellText(r[5]);
    const dose = cellText(r[6]);
    const durationDays = parseNumber(r[7]);
    const withdrawalDays = parseNumber(r[8]);
    const responsible = cellText(r[10]);
    const notes = cellText(r[11]);
    const animal = resolveAnimal(catalogs, code);

    if (!code) errors.push("Código vacío");
    else if (!animal) errors.push(`Animal "${code}" no encontrado en la estancia`);
    if (!eventDate) errors.push(`Fecha inválida: "${r[1] ?? ""}"`);
    if (!medication) errors.push("Medicamento vacío");

    return {
      rowIndex: i + 1,
      label: code ?? `fila ${i + 2}`,
      errors,
      hasError: errors.length > 0,
      preview: { Código: code ?? "", Fecha: eventDate ?? "", Medicamento: medication ?? "", "Días retiro": withdrawalDays !== null ? String(withdrawalDays) : "" },
      payload: {
        rowIndex: i + 1,
        idRanchAnimal: animal?.id,
        illness: illness ?? undefined,
        medication: medication ?? undefined,
        dose: dose ?? undefined,
        durationDays: durationDays ?? undefined,
        withdrawalDays: withdrawalDays ?? undefined,
        responsible: responsible ?? undefined,
        notes: notes ?? undefined,
        eventDate: eventDate ? new Date(eventDate).toISOString() : undefined,
      },
    };
  });
}

function mapIncidentType(raw: unknown): "illness_detected" | "quarantine" | null {
  const s = normalizeText(raw).toLowerCase();
  if (s.includes("quarantine") || s.includes("cuarenten")) return "quarantine";
  if (s.includes("illness") || s.includes("enferm")) return "illness_detected";
  return null;
}

function parseIncidents(rawRows: unknown[][], catalogs: BulkImportCatalogs): ParsedRow[] {
  return rawRows.map((r, i) => {
    const errors: string[] = [];
    const code = cellText(r[2]);
    const eventDate = parseExcelDate(r[1]);
    const incidentType = mapIncidentType(r[4]);
    const description = cellText(r[5]);
    const resolvedAt = parseExcelDate(r[6]);
    const responsible = cellText(r[7]);
    const notesRaw = cellText(r[8]);
    const notes = responsible ? [`Responsable: ${responsible}`, notesRaw].filter(Boolean).join(" — ") : (notesRaw ?? undefined);
    const animal = resolveAnimal(catalogs, code);

    if (!code) errors.push("Código vacío");
    else if (!animal) errors.push(`Animal "${code}" no encontrado en la estancia`);
    if (!eventDate) errors.push(`Fecha inválida: "${r[1] ?? ""}"`);
    if (!incidentType) errors.push(`Tipo de incidente "${r[4] ?? ""}" no reconocido (usar illness_detected/quarantine)`);

    return {
      rowIndex: i + 1,
      label: code ?? `fila ${i + 2}`,
      errors,
      hasError: errors.length > 0,
      preview: { Código: code ?? "", Fecha: eventDate ?? "", Tipo: incidentType ?? String(r[4] ?? ""), Resuelto: resolvedAt ?? "" },
      payload: {
        rowIndex: i + 1,
        idRanchAnimal: animal?.id,
        incidentType: incidentType ?? undefined,
        description: description ?? undefined,
        resolvedAt: resolvedAt ? new Date(resolvedAt).toISOString() : undefined,
        notes,
        eventDate: eventDate ? new Date(eventDate).toISOString() : undefined,
      },
    };
  });
}

export async function parseHealthFile(file: File, catalogs: BulkImportCatalogs): Promise<ImportSection[]> {
  const workbook = await readWorkbookFromFile(file);

  return [
    { key: "vaccinations", label: "Vacunas", rows: parseVaccinations(pickSheetRows(workbook, "Carga_Vacunas"), catalogs) },
    { key: "treatments", label: "Tratamientos", rows: parseTreatments(pickSheetRows(workbook, "Carga_Tratamientos"), catalogs) },
    { key: "healthIncidents", label: "Incidentes sanitarios", rows: parseIncidents(pickSheetRows(workbook, "Carga_Incidentes"), catalogs) },
  ];
}
