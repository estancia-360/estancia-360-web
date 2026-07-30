import { apiFetch } from "@/lib/api-client";
import type { FatteningSystemType, RearingDestination, RearingSelection, WeightRecord, WeightType } from "@/features/rearing/types";

interface PaginatedResponse<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; pages: number };
}

export function getWeightRecords(idRanchAnimal: number, page: number, accessToken: string): Promise<PaginatedResponse<WeightRecord>> {
  return apiFetch(`/weight-records/animal/${idRanchAnimal}?page=${page}&limit=20`, { accessToken });
}

export interface RegisterWeightRecordInput {
  idRanchAnimal: number;
  idLot: number;
  weight: number;
  weightType: WeightType;
  bodyCondition?: number;
  ageDays?: number;
  notes?: string;
  eventDate: string;
}

export function registerWeightRecord(data: RegisterWeightRecordInput, accessToken: string): Promise<{ weightRecord: WeightRecord }> {
  return apiFetch("/rearing/weight-record", { method: "POST", body: data, accessToken });
}

export function getRearingSelections(
  idRanchAnimal: number,
  page: number,
  accessToken: string,
): Promise<PaginatedResponse<RearingSelection>> {
  return apiFetch(`/rearing-selections/animal/${idRanchAnimal}?page=${page}&limit=20`, { accessToken });
}

export interface RegisterRearingSelectionInput {
  idRanchAnimal: number;
  destination: RearingDestination;
  idLotDest?: number;
  systemType?: FatteningSystemType;
  weightAtSelection?: number;
  bodyCondition?: number;
  geneticScore?: number;
  notes?: string;
  eventDate: string;
}

export function registerRearingSelection(
  data: RegisterRearingSelectionInput,
  accessToken: string,
): Promise<{ rearingSelection: RearingSelection }> {
  return apiFetch("/rearing/rearing-selection", { method: "POST", body: data, accessToken });
}
