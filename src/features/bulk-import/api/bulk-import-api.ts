import { apiFetch } from "@/lib/api-client";

export interface BulkImportRowResult {
  rowIndex: number;
  success: boolean;
  id?: number;
  errorCode?: string;
  message?: string;
}

export interface BulkImportResult {
  totalRows: number;
  succeeded: number;
  failed: number;
  results: BulkImportRowResult[];
}

export interface BulkImportHealthResult {
  vaccinations: BulkImportResult;
  treatments: BulkImportResult;
  healthIncidents: BulkImportResult;
}

export interface BulkImportMovementsResult {
  movements: BulkImportResult;
  exits: BulkImportResult;
}

export function bulkImportAnimals(idRanch: number, rows: Record<string, unknown>[], accessToken: string): Promise<BulkImportResult> {
  return apiFetch("/bulk-import/animals", { method: "POST", body: { idRanch, rows }, accessToken });
}

export function bulkImportWeights(idRanch: number, rows: Record<string, unknown>[], accessToken: string): Promise<BulkImportResult> {
  return apiFetch("/bulk-import/weights", { method: "POST", body: { idRanch, rows }, accessToken });
}

export function bulkImportGestation(idRanch: number, rows: Record<string, unknown>[], accessToken: string): Promise<BulkImportResult> {
  return apiFetch("/bulk-import/gestation", { method: "POST", body: { idRanch, rows }, accessToken });
}

export function bulkImportHealth(
  idRanch: number,
  data: { vaccinations?: Record<string, unknown>[]; treatments?: Record<string, unknown>[]; healthIncidents?: Record<string, unknown>[] },
  accessToken: string,
): Promise<BulkImportHealthResult> {
  return apiFetch("/bulk-import/health", { method: "POST", body: { idRanch, ...data }, accessToken });
}

export function bulkImportMovements(
  idRanch: number,
  data: { groups?: Record<string, unknown>[]; exits?: Record<string, unknown>[] },
  accessToken: string,
): Promise<BulkImportMovementsResult> {
  return apiFetch("/bulk-import/movements", { method: "POST", body: { idRanch, ...data }, accessToken });
}
