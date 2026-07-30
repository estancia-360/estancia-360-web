import { apiFetch } from "@/lib/api-client";
import type { FatteningEntry, FatteningSystemType, FeedRecord } from "@/features/fattening/types";

interface PaginatedResponse<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; pages: number };
}

export interface RegisterFatteningEntryInput {
  idRanchAnimal: number;
  idLotDest: number;
  systemType: FatteningSystemType;
  initialWeight?: number;
  notes?: string;
  eventDate: string;
}

export function registerFatteningEntry(data: RegisterFatteningEntryInput, accessToken: string): Promise<{ fatteningEntry: FatteningEntry }> {
  return apiFetch("/fattening/entry", { method: "POST", body: data, accessToken });
}

export function getFeedRecords(idLot: number, page: number, accessToken: string): Promise<PaginatedResponse<FeedRecord>> {
  return apiFetch(`/feed-records/lot/${idLot}?page=${page}&limit=20`, { accessToken });
}

export interface RegisterFeedRecordInput {
  idLot: number;
  feedDate: string;
  feedType: string;
  quantity?: number;
  unit?: string;
  cost?: number;
  notes?: string;
}

export function registerFeedRecord(data: RegisterFeedRecordInput, accessToken: string): Promise<{ feedRecord: FeedRecord }> {
  return apiFetch("/fattening/feed-record", { method: "POST", body: data, accessToken });
}
