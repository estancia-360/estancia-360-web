import { apiFetch } from "@/lib/api-client";
import type { AnimalBreed, AnimalClass, RanchAnimal, RanchLot } from "@/features/animals/types";

interface PaginatedResponse<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; pages: number };
}

export function getRanchAnimals(
  idRanch: number,
  page: number,
  accessToken: string,
  limit = 20,
): Promise<PaginatedResponse<RanchAnimal>> {
  return apiFetch(`/ranch-animals/${idRanch}?page=${page}&limit=${limit}`, { accessToken });
}

export function getAnimalClasses(accessToken: string): Promise<AnimalClass[]> {
  return apiFetch("/animal-classes", { accessToken });
}

export function getAnimalBreeds(accessToken: string): Promise<{ breeds: AnimalBreed[] }> {
  return apiFetch("/animal-breeds", { accessToken });
}

export function getRanchLots(idRanch: number, accessToken: string): Promise<RanchLot[]> {
  return apiFetch(`/ranch-lots/by-ranch/${idRanch}`, { accessToken });
}

export interface CreateRanchAnimalInput {
  idRanch: number;
  code: string;
  idBreed: number;
  idStatus: number;
  idAnimalClass: number;
  sex: "F" | "M";
  birthdate: string;
  idProductiveStatus?: number;
  idLot?: number;
  weight?: number;
  origin?: string;
  codeMother?: string;
  codeFather?: string;
  createdAt: string;
}

export function createRanchAnimal(data: CreateRanchAnimalInput, accessToken: string): Promise<{ message: string }> {
  return apiFetch("/ranch-animals", { method: "POST", body: data, accessToken });
}
