import { read as xlsxRead, utils as xlsxUtils, type WorkBook } from "xlsx";

export async function readWorkbookFromFile(file: File): Promise<WorkBook> {
  const buffer = await file.arrayBuffer();
  return xlsxRead(buffer, { type: "array", cellDates: true });
}

/** Picks the sheet by exact name (the real templates always name their data sheet), falling back to the first sheet. */
export function pickSheetRows(workbook: WorkBook, sheetName: string): unknown[][] {
  const name = workbook.SheetNames.includes(sheetName) ? sheetName : workbook.SheetNames[0];
  const sheet = workbook.Sheets[name];
  const rows = xlsxUtils.sheet_to_json(sheet, { header: 1, defval: null }) as unknown[][];
  return rows.slice(1).filter((r) => r.some((c) => c !== null && c !== ""));
}

export function sheetExists(workbook: WorkBook, sheetName: string): boolean {
  return workbook.SheetNames.includes(sheetName);
}

const EXCEL_EPOCH_OFFSET_DAYS = 25569;

export function parseExcelDate(raw: unknown): string | null {
  if (raw === null || raw === undefined || raw === "") return null;
  if (raw instanceof Date) return Number.isNaN(raw.getTime()) ? null : raw.toISOString().slice(0, 10);
  if (typeof raw === "number") {
    const date = new Date(Math.round((raw - EXCEL_EPOCH_OFFSET_DAYS) * 86400 * 1000));
    return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
  }
  if (typeof raw === "string") {
    const str = raw.trim();
    const ddmmyyyy = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(str);
    if (ddmmyyyy) {
      const [, d, m, y] = ddmmyyyy;
      const date = new Date(Number(y), Number(m) - 1, Number(d));
      if (!Number.isNaN(date.getTime())) return date.toISOString().slice(0, 10);
    }
    if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.slice(0, 10);
    const date = new Date(str);
    if (!Number.isNaN(date.getTime())) return date.toISOString().slice(0, 10);
  }
  return null;
}

export function parseNumber(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === "") return null;
  const n = Number(String(raw).replace(",", "."));
  return Number.isNaN(n) ? null : n;
}

export function normalizeText(raw: unknown): string {
  return String(raw ?? "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function cellText(raw: unknown): string | null {
  const s = raw === null || raw === undefined ? "" : String(raw).trim();
  return s === "" ? null : s;
}
