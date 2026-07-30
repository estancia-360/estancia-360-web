export interface RanchPasture {
  id: number;
  idRanch: number;
  name: string;
  areaHectares: string | number;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type LotType = "cria" | "recria" | "engorde" | "reproductiva" | "general";

export const LOT_TYPE_LABELS: Record<LotType, string> = {
  cria: "Cría",
  recria: "Recría",
  engorde: "Engorde",
  reproductiva: "Reproductiva",
  general: "General",
};

export interface RanchLot {
  id: number;
  idRanch: number;
  idRanchPasture: number;
  name: string;
  lotType: LotType;
  capacity: number | null;
  isActive: boolean;
  animalsCount?: number;
  createdAt: string;
  updatedAt: string;
}
