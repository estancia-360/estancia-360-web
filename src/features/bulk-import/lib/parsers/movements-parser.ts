import type { BulkImportCatalogs } from "../catalogs";
import { fuzzyMatchByName } from "../catalogs";
import { matchAnimalClass, matchBreed } from "../class-breed-match";
import { cellText, normalizeText, parseExcelDate, parseNumber, pickSheetRows, readWorkbookFromFile, sheetExists } from "../parse-helpers";
import type { ImportSection, ParsedRow } from "../../types";

function mapSex(raw: unknown): "F" | "M" | null {
  const s = cellText(raw)?.toUpperCase();
  if (!s) return null;
  if (s === "F" || s.startsWith("H")) return "F";
  if (s === "M" || s.startsWith("M")) return "M";
  return null;
}

const PRODUCTIVE_STATUS_BY_LABEL: Record<string, number> = { CRIA: 1, RECRIA: 2, ENGORDE: 3 };
function mapProductiveStatus(raw: unknown): number | undefined {
  const s = normalizeText(raw);
  for (const [label, id] of Object.entries(PRODUCTIVE_STATUS_BY_LABEL)) {
    if (s.includes(label)) return id;
  }
  return undefined;
}

function groupByCarga(rows: unknown[][]): { groupId: string; rows: unknown[][] }[] {
  const groups = new Map<string, unknown[][]>();
  for (const r of rows) {
    const id = cellText(r[0]) ?? `SIN_ID_${groups.size + 1}`;
    if (!groups.has(id)) groups.set(id, []);
    groups.get(id)!.push(r);
  }
  return Array.from(groups.entries()).map(([groupId, groupRows]) => ({ groupId, rows: groupRows }));
}

function parsePurchases(rawRows: unknown[][], catalogs: BulkImportCatalogs): ParsedRow[] {
  return groupByCarga(rawRows).map((group, i) => {
    const first = group.rows[0];
    const eventDate = parseExcelDate(first[1]);
    const originName = cellText(first[2]);
    const totalPrice = parseNumber(first[3]);
    const pricePerKg = parseNumber(first[4]);
    const notes = cellText(first[5]);

    const errors: string[] = [];
    if (!eventDate) errors.push(`Fecha inválida en grupo "${group.groupId}"`);

    const animals = group.rows.map((r) => {
      const code = cellText(r[6]);
      const sex = mapSex(r[7]);
      const breed = matchBreed(cellText(r[8]), catalogs.breeds);
      const animalClass = matchAnimalClass(cellText(r[9]), sex, catalogs.classes);
      const birthdate = parseExcelDate(r[10]);
      const weight = parseNumber(r[11]);
      const lot = cellText(r[12]) ? fuzzyMatchByName(catalogs.lotsByName, cellText(r[12])) : null;
      const idProductiveStatus = mapProductiveStatus(r[13]);
      const animalNotes = cellText(r[14]);

      if (!code) errors.push("Código de animal nuevo vacío");
      if (!sex) errors.push(`Sexo "${r[7] ?? ""}" no reconocido para "${code}"`);
      if (!breed) errors.push(`Raza "${r[8] ?? ""}" no reconocida para "${code}"`);
      if (!animalClass) errors.push(`Categoría "${r[9] ?? ""}" no reconocida para "${code}"`);
      if (!birthdate) errors.push(`Fecha de nacimiento inválida para "${code}"`);

      return {
        newAnimal: {
          code,
          sex,
          idBreed: breed?.id,
          idAnimalClass: animalClass?.id,
          birthdate,
          weight: weight ?? undefined,
          idLot: lot?.id,
          idProductiveStatus,
        },
        notes: animalNotes ?? undefined,
      };
    });

    return {
      rowIndex: i + 1,
      label: group.groupId,
      errors,
      hasError: errors.length > 0,
      preview: { Grupo: group.groupId, Fecha: eventDate ?? "", Proveedor: originName ?? "", Animales: String(animals.length) },
      payload: {
        rowIndex: i + 1,
        movementType: "purchase",
        movementDate: eventDate ?? undefined,
        originName: originName ?? undefined,
        totalPrice: totalPrice ?? undefined,
        pricePerKg: pricePerKg ?? undefined,
        notes: notes ?? undefined,
        animals,
      },
    };
  });
}

function parseExistingAnimalGroups(
  rawRows: unknown[][],
  catalogs: BulkImportCatalogs,
  movementType: "sale" | "pasture_transfer" | "ranch_exit",
  cols: { codigoAnimal: number; loteDestino?: number; notasAnimal: number; counterpart?: number; totalPrice?: number; pricePerKg?: number; notasOperacion: number },
): ParsedRow[] {
  return groupByCarga(rawRows).map((group, i) => {
    const first = group.rows[0];
    const eventDate = parseExcelDate(first[1]);
    const counterpartName = cols.counterpart !== undefined ? cellText(first[cols.counterpart]) : undefined;
    const totalPrice = cols.totalPrice !== undefined ? parseNumber(first[cols.totalPrice]) : null;
    const pricePerKg = cols.pricePerKg !== undefined ? parseNumber(first[cols.pricePerKg]) : null;
    const notes = cellText(first[cols.notasOperacion]);

    const errors: string[] = [];
    if (!eventDate) errors.push(`Fecha inválida en grupo "${group.groupId}"`);

    const animals = group.rows.map((r) => {
      const code = cellText(r[cols.codigoAnimal]);
      const animal = code ? catalogs.animalsByCode.get(normalizeText(code)) : null;
      const lotDest = cols.loteDestino !== undefined && cellText(r[cols.loteDestino]) ? fuzzyMatchByName(catalogs.lotsByName, cellText(r[cols.loteDestino])) : null;
      const animalNotes = cellText(r[cols.notasAnimal]);

      if (!code) errors.push("Código de animal vacío");
      else if (!animal) errors.push(`Animal "${code}" no encontrado en la estancia`);
      if (movementType === "pasture_transfer" && cols.loteDestino !== undefined && !lotDest) {
        errors.push(`Lote destino "${cellText(r[cols.loteDestino]) ?? ""}" no encontrado para "${code}"`);
      }

      return {
        idRanchAnimal: animal?.id,
        idLotDest: movementType === "pasture_transfer" ? lotDest?.id : undefined,
        notes: animalNotes ?? undefined,
      };
    });

    return {
      rowIndex: i + 1,
      label: group.groupId,
      errors,
      hasError: errors.length > 0,
      preview: { Grupo: group.groupId, Fecha: eventDate ?? "", Contraparte: counterpartName ?? "", Animales: String(animals.length) },
      payload: {
        rowIndex: i + 1,
        movementType,
        movementDate: eventDate ?? undefined,
        counterpartName: counterpartName ?? undefined,
        totalPrice: totalPrice ?? undefined,
        pricePerKg: pricePerKg ?? undefined,
        notes: notes ?? undefined,
        animals,
      },
    };
  });
}

function parseExits(rawRows: unknown[][], catalogs: BulkImportCatalogs): ParsedRow[] {
  return rawRows.map((r, i) => {
    const errors: string[] = [];
    const code = cellText(r[2]);
    const eventDate = parseExcelDate(r[1]);
    const reasonRaw = normalizeText(r[4]).toLowerCase();
    const reason = (["death", "discard", "loss", "other"] as const).find((v) => reasonRaw.includes(v)) ?? null;
    const notes = cellText(r[5]);
    const animal = code ? catalogs.animalsByCode.get(normalizeText(code)) : null;

    if (!code) errors.push("Código vacío");
    else if (!animal) errors.push(`Animal "${code}" no encontrado en la estancia`);
    if (!eventDate) errors.push(`Fecha inválida: "${r[1] ?? ""}"`);
    if (!reason) errors.push(`Motivo "${r[4] ?? ""}" no reconocido (death/discard/loss/other)`);
    if (reason === "other" && !notes) errors.push('Notas obligatorias cuando el motivo es "other"');

    return {
      rowIndex: i + 1,
      label: code ?? `fila ${i + 2}`,
      errors,
      hasError: errors.length > 0,
      preview: { Código: code ?? "", Fecha: eventDate ?? "", Motivo: reason ?? String(r[4] ?? "") },
      payload: {
        rowIndex: i + 1,
        idRanchAnimal: animal?.id,
        reason: reason ?? undefined,
        notes: notes ?? undefined,
        eventDate: eventDate ? new Date(eventDate).toISOString() : undefined,
      },
    };
  });
}

export async function parseMovementsFile(file: File, catalogs: BulkImportCatalogs): Promise<ImportSection[]> {
  const workbook = await readWorkbookFromFile(file);

  const purchases = sheetExists(workbook, "Carga_Compras") ? parsePurchases(pickSheetRows(workbook, "Carga_Compras"), catalogs) : [];
  const sales = sheetExists(workbook, "Carga_Ventas")
    ? parseExistingAnimalGroups(pickSheetRows(workbook, "Carga_Ventas"), catalogs, "sale", {
        codigoAnimal: 6,
        notasAnimal: 9,
        counterpart: 2,
        totalPrice: 3,
        pricePerKg: 4,
        notasOperacion: 5,
      })
    : [];
  const transfers = sheetExists(workbook, "Carga_Traslados")
    ? parseExistingAnimalGroups(pickSheetRows(workbook, "Carga_Traslados"), catalogs, "pasture_transfer", {
        codigoAnimal: 3,
        loteDestino: 5,
        notasAnimal: 6,
        notasOperacion: 2,
      })
    : [];
  const ranchExits = sheetExists(workbook, "Carga_Salidas_Estancia")
    ? parseExistingAnimalGroups(pickSheetRows(workbook, "Carga_Salidas_Estancia"), catalogs, "ranch_exit", {
        codigoAnimal: 4,
        notasAnimal: 6,
        counterpart: 2,
        notasOperacion: 3,
      })
    : [];
  const exits = sheetExists(workbook, "Carga_Bajas") ? parseExits(pickSheetRows(workbook, "Carga_Bajas"), catalogs) : [];

  // Re-sequence rowIndex across the 4 group sheets so they land in one flat "groups" array on submit.
  let seq = 0;
  const allGroups = [...purchases, ...sales, ...transfers, ...ranchExits].map((row) => {
    seq += 1;
    return { ...row, rowIndex: seq, payload: { ...row.payload, rowIndex: seq } };
  });

  return [
    { key: "groups", label: "Compras / Ventas / Traslados / Salidas", rows: allGroups },
    { key: "exits", label: "Bajas", rows: exits },
  ];
}
