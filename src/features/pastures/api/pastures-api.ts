import { apiFetch } from "@/lib/api-client";
import type { LotType, RanchLot, RanchPasture } from "@/features/pastures/types";

export function getRanchPastures(idRanch: number, accessToken: string): Promise<RanchPasture[]> {
  return apiFetch(`/ranch-pastures/by-ranch/${idRanch}`, { accessToken });
}

export interface CreatePastureInput {
  idRanch: number;
  name: string;
  areaHectares: number;
  description?: string;
}

export function createRanchPasture(data: CreatePastureInput, accessToken: string): Promise<RanchPasture> {
  return apiFetch("/ranch-pastures", { method: "POST", body: data, accessToken });
}

export interface UpdatePastureInput {
  name?: string;
  areaHectares?: number;
  description?: string;
}

export function updateRanchPasture(id: number, data: UpdatePastureInput, accessToken: string): Promise<RanchPasture> {
  return apiFetch(`/ranch-pastures/${id}`, { method: "PATCH", body: data, accessToken });
}

export function deleteRanchPasture(id: number, accessToken: string): Promise<void> {
  return apiFetch(`/ranch-pastures/${id}`, { method: "DELETE", accessToken });
}

export function getRanchLots(idRanch: number, accessToken: string): Promise<RanchLot[]> {
  return apiFetch(`/ranch-lots/by-ranch/${idRanch}`, { accessToken });
}

export interface CreateLotInput {
  idRanch: number;
  idRanchPasture: number;
  name: string;
  lotType: LotType;
  capacity?: number;
}

export function createRanchLot(data: CreateLotInput, accessToken: string): Promise<RanchLot> {
  return apiFetch("/ranch-lots", { method: "POST", body: data, accessToken });
}

export interface UpdateLotInput {
  name?: string;
  lotType?: LotType;
  capacity?: number;
}

export function updateRanchLot(id: number, data: UpdateLotInput, accessToken: string): Promise<RanchLot> {
  return apiFetch(`/ranch-lots/${id}`, { method: "PATCH", body: data, accessToken });
}

export function deleteRanchLot(id: number, accessToken: string): Promise<void> {
  return apiFetch(`/ranch-lots/${id}`, { method: "DELETE", accessToken });
}
