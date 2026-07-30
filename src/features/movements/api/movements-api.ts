import { apiFetch } from "@/lib/api-client";
import type { AnimalExit, ExitReason, Movement, MovementAnimalStatus, MovementType } from "@/features/movements/types";

interface PaginatedResponse<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; pages: number };
}

export function getMovements(idRanch: number, page: number, accessToken: string): Promise<PaginatedResponse<Movement>> {
  return apiFetch(`/movements/ranch/${idRanch}?page=${page}&limit=20`, { accessToken });
}

interface RegisterMovementAnimalInput {
  idRanchAnimal?: number;
  idLotDest?: number;
  notes?: string;
  newAnimal?: {
    idBreed: number;
    idAnimalClass: number;
    code: string;
    sex: "F" | "M";
    birthdate: string;
    weight?: number;
    idLot?: number;
    idProductiveStatus?: number;
  };
}

export interface RegisterMovementInput {
  idRanch: number;
  idUser: number;
  movementType: MovementType;
  movementDate: string;
  counterpartName?: string;
  originName?: string;
  totalPrice?: number;
  pricePerKg?: number;
  notes?: string;
  animals: RegisterMovementAnimalInput[];
}

export function registerMovement(data: RegisterMovementInput, accessToken: string): Promise<{ movement: Movement }> {
  return apiFetch("/movements/register", { method: "POST", body: data, accessToken });
}

export function confirmMovementAnimal(
  idMovementAnimal: number,
  status: "accepted" | "rejected",
  accessToken: string,
): Promise<{ movement: Movement }> {
  return apiFetch(`/movements/animal/${idMovementAnimal}/confirm`, { method: "PATCH", body: { status }, accessToken });
}

export function cancelMovement(idMovement: number, accessToken: string): Promise<{ movement: Movement }> {
  return apiFetch(`/movements/${idMovement}/cancel`, { method: "PATCH", accessToken });
}

export interface RegisterAnimalExitInput {
  idRanchAnimal: number;
  reason: ExitReason;
  notes?: string;
  eventDate: string;
}

export function registerAnimalExit(data: RegisterAnimalExitInput, accessToken: string): Promise<{ animalExit: AnimalExit }> {
  return apiFetch("/movements/animal-exit", { method: "POST", body: data, accessToken });
}

// Re-exported so callers don't need to import MovementAnimalStatus separately just for typing confirm calls.
export type { MovementAnimalStatus };
