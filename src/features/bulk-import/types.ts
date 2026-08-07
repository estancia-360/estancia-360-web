import type { BulkImportResult } from "./api/bulk-import-api";

export interface ParsedRow {
  rowIndex: number;
  label: string;
  errors: string[];
  hasError: boolean;
  preview: Record<string, string>;
  payload: Record<string, unknown>;
}

export interface ImportSection {
  key: string;
  label: string;
  rows: ParsedRow[];
}

export interface SectionOutcome {
  key: string;
  label: string;
  result: BulkImportResult;
}
