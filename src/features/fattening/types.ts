export type FatteningSystemType = "field" | "feedlot";

export const FATTENING_SYSTEM_TYPE_LABELS: Record<FatteningSystemType, string> = {
  field: "Campo",
  feedlot: "Feedlot",
};

interface AnimalEvent {
  id: number;
  idRanchAnimal: number;
  idEventType: number;
  notes: string | null;
  isSynced: boolean;
  eventDate: string;
  animal: { id: number; code: string; sex: "F" | "M" };
}

export interface FatteningEntry {
  id: number;
  idEvent: number;
  initialWeight: number | string | null;
  systemType: FatteningSystemType;
  createdAt: string;
  event: AnimalEvent;
}

export interface FeedRecord {
  id: number;
  idLot: number;
  idUser: number | null;
  feedDate: string;
  feedType: string;
  quantity: number | string | null;
  unit: string | null;
  cost: number | string | null;
  notes: string | null;
  isSynced: boolean;
  createdAt: string;
}
