export type WeightType = "scale" | "estimated";

export const WEIGHT_TYPE_LABELS: Record<WeightType, string> = {
  scale: "Balanza",
  estimated: "Estimado",
};

export interface WeightRecord {
  id: number;
  idEvent: number;
  idLot: number;
  weight: number | string;
  weightType: WeightType;
  bodyCondition: number | null;
  ageDays: number | null;
  notes: string | null;
  createdAt: string;
  event: {
    id: number;
    idRanchAnimal: number;
    idEventType: number;
    notes: string | null;
    isSynced: boolean;
    eventDate: string;
    animal: { id: number; code: string; sex: "F" | "M" };
  };
}

export type RearingDestination = "replacement" | "fattening" | "sale";

export const REARING_DESTINATION_LABELS: Record<RearingDestination, string> = {
  replacement: "Queda en Recría",
  fattening: "A Engorde",
  sale: "Venta / Baja",
};

export type FatteningSystemType = "field" | "feedlot";

export const FATTENING_SYSTEM_TYPE_LABELS: Record<FatteningSystemType, string> = {
  field: "Campo",
  feedlot: "Feedlot",
};

export interface RearingSelection {
  id: number;
  idEvent: number;
  idLotDest: number | null;
  destination: RearingDestination;
  weightAtSelection: number | string | null;
  bodyCondition: number | null;
  geneticScore: number | string | null;
  createdAt: string;
  event: {
    id: number;
    idRanchAnimal: number;
    idEventType: number;
    notes: string | null;
    isSynced: boolean;
    eventDate: string;
    animal: { id: number; code: string; sex: "F" | "M" };
  };
}
