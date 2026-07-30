export type MovementType = "sale" | "purchase" | "pasture_transfer" | "ranch_exit";

export const MOVEMENT_TYPE_LABELS: Record<MovementType, string> = {
  sale: "Venta",
  purchase: "Compra",
  pasture_transfer: "Traslado",
  ranch_exit: "Salida a otra estancia",
};

export type MovementStatus = "pending" | "confirmed" | "cancelled";

export const MOVEMENT_STATUS_LABELS: Record<MovementStatus, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  cancelled: "Cancelado",
};

export type MovementAnimalStatus = "pending" | "accepted" | "rejected" | "confirmed";

export const MOVEMENT_ANIMAL_STATUS_LABELS: Record<MovementAnimalStatus, string> = {
  pending: "Pendiente",
  accepted: "Aceptado",
  rejected: "Rechazado",
  confirmed: "Confirmado",
};

export type ExitReason = "death" | "discard" | "loss" | "other";

export const EXIT_REASON_LABELS: Record<ExitReason, string> = {
  death: "Muerte",
  discard: "Descarte",
  loss: "Pérdida",
  other: "Otro",
};

interface MovementAnimalDetail {
  id: number;
  code: string;
  sex: "F" | "M";
}

export interface MovementAnimal {
  id: number;
  idMovement: number;
  idRanchAnimal: number;
  idLotOrigin: number | null;
  idLotDest: number | null;
  prevIdStatus: number | null;
  status: MovementAnimalStatus;
  idEvent: number | null;
  notes: string | null;
  animal: MovementAnimalDetail;
}

export interface Movement {
  id: number;
  idRanch: number;
  idUser: number;
  movementType: MovementType;
  movementDate: string;
  counterpartName: string | null;
  originName: string | null;
  totalPrice: number | string | null;
  pricePerKg: number | string | null;
  notes: string | null;
  status: MovementStatus;
  createdAt: string;
  animals: MovementAnimal[];
}

interface AnimalEvent {
  id: number;
  idRanchAnimal: number;
  idEventType: number;
  notes: string | null;
  isSynced: boolean;
  eventDate: string;
  animal: { id: number; code: string; sex: "F" | "M" };
}

export interface AnimalExit {
  id: number;
  idEvent: number;
  reason: ExitReason;
  notes: string | null;
  createdAt: string;
  event: AnimalEvent;
}
