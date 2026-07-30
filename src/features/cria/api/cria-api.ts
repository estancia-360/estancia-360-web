import { apiFetch } from "@/lib/api-client";
import type {
  BirthType,
  BreedingService,
  CriaStatus,
  GestationDiagnosis,
  GestationMethod,
  GestationResult,
  MotherCondition,
  Parturition,
  ServiceType,
  Weaning,
} from "@/features/cria/types";

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

export function registerBreedingService(
  data: RegisterBreedingServiceInput,
  accessToken: string,
): Promise<{ breedingService: BreedingService }> {
  return apiFetch("/breeding/breeding-service", { method: "POST", body: data, accessToken });
}

export function getGestationDiagnoses(
  idRanch: number,
  page: number,
  accessToken: string,
): Promise<PaginatedResponse<GestationDiagnosis>> {
  return apiFetch(`/gestation-diagnoses/by-ranch/${idRanch}?page=${page}&limit=20`, { accessToken });
}

export interface RegisterGestationDiagnosisInput {
  idRanchAnimal: number;
  idService: number;
  method: GestationMethod;
  result: GestationResult;
  gestationDays?: number;
  estimatedBirth?: string;
  veterinarian?: string;
  notes?: string;
  eventDate: string;
}

export function registerGestationDiagnosis(
  data: RegisterGestationDiagnosisInput,
  accessToken: string,
): Promise<{ gestationDiagnosis: GestationDiagnosis }> {
  return apiFetch("/breeding/gestation-diagnosis", { method: "POST", body: data, accessToken });
}

export function getParturitions(idRanch: number, page: number, accessToken: string): Promise<PaginatedResponse<Parturition>> {
  return apiFetch(`/parturitions/by-ranch/${idRanch}?page=${page}&limit=20`, { accessToken });
}

export interface RegisterParturitionInput {
  idRanchAnimal: number;
  idDiagnosis: number;
  birthType: BirthType;
  criaStatus: CriaStatus;
  criaWeight?: number;
  motherCondition?: MotherCondition;
  criaData?: {
    code: string;
    idBreed: number;
    idStatus: number;
    idAnimalClass: number;
    sex: "F" | "M";
    weight?: number;
  };
  notes?: string;
  eventDate: string;
}

export function registerParturition(data: RegisterParturitionInput, accessToken: string): Promise<{ parturition: Parturition }> {
  return apiFetch("/breeding/parturition", { method: "POST", body: data, accessToken });
}

export function getWeanings(idRanch: number, page: number, accessToken: string): Promise<PaginatedResponse<Weaning>> {
  return apiFetch(`/breeding/weanings/by-ranch/${idRanch}?page=${page}&limit=20`, { accessToken });
}

export interface RegisterWeaningInput {
  idRanchAnimal: number;
  idLotDest: number;
  weaningWeight?: number;
  weaningAge?: number;
  notes?: string;
  eventDate: string;
}

export function registerWeaning(data: RegisterWeaningInput, accessToken: string): Promise<{ weaning: Weaning }> {
  return apiFetch("/breeding/weaning", { method: "POST", body: data, accessToken });
}
