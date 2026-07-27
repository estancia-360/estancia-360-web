import { apiFetch } from "@/lib/api-client";
import type { BreedingService, ServiceType } from "@/features/cria/types";

interface PaginatedResponse<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; pages: number };
}

export function getBreedingServices(idRanch: number, page: number, accessToken: string): Promise<PaginatedResponse<BreedingService>> {
  return apiFetch(`/breeding-services/by-ranch/${idRanch}?page=${page}&limit=20`, { accessToken });
}

export interface RegisterBreedingServiceInput {
  idRanchAnimal: number;
  serviceType: ServiceType;
  idAnimalMale?: number;
  semenBreed?: string;
  technician?: string;
  reproductiveLot?: string;
  eventDate: string;
}

export function registerBreedingService(data: RegisterBreedingServiceInput, accessToken: string): Promise<{ breedingService: BreedingService }> {
  return apiFetch("/breeding/breeding-service", { method: "POST", body: data, accessToken });
}
