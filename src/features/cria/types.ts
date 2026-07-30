export type ServiceType = "natural" | "artificial_insemination" | "embryo_transfer";

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  natural: "Monta natural",
  artificial_insemination: "Inseminación artificial",
  embryo_transfer: "Transferencia de embriones",
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

export interface BreedingService {
  id: number;
  idEvent: number;
  idAnimalMale: number | null;
  serviceType: ServiceType;
  semenBreed: string | null;
  technician: string | null;
  reproductiveLot: string | null;
  createdAt: string;
  event: AnimalEvent;
}

export type GestationMethod = "palpation" | "ultrasound";

export const GESTATION_METHOD_LABELS: Record<GestationMethod, string> = {
  palpation: "Palpación",
  ultrasound: "Ecografía",
};

export type GestationResult = "pregnant" | "empty";

export const GESTATION_RESULT_LABELS: Record<GestationResult, string> = {
  pregnant: "Preñada",
  empty: "Vacía",
};

export interface GestationDiagnosis {
  id: number;
  idEvent: number;
  idService: number;
  method: GestationMethod;
  result: GestationResult;
  gestationDays: number | null;
  estimatedBirth: string | null;
  veterinarian: string | null;
  createdAt: string;
  event: AnimalEvent;
}

export type BirthType = "normal" | "assisted" | "cesarean";

export const BIRTH_TYPE_LABELS: Record<BirthType, string> = {
  normal: "Normal",
  assisted: "Asistido",
  cesarean: "Cesárea",
};

export type CriaStatus = "alive" | "dead";

export const CRIA_STATUS_LABELS: Record<CriaStatus, string> = {
  alive: "Viva",
  dead: "Muerta",
};

export type MotherCondition = "good" | "regular" | "bad";

export const MOTHER_CONDITION_LABELS: Record<MotherCondition, string> = {
  good: "Buena",
  regular: "Regular",
  bad: "Mala",
};

export interface Parturition {
  id: number;
  idEvent: number;
  idDiagnosis: number;
  idCria: number | null;
  birthType: BirthType;
  criaWeight: number | string | null;
  criaStatus: CriaStatus;
  motherCondition: MotherCondition | null;
  createdAt: string;
  event: AnimalEvent;
  cria?: { id: number; code: string; sex: "F" | "M" } | null;
}

export interface Weaning {
  id: number;
  idEvent: number;
  idCria: number;
  idLotDest: number;
  weaningWeight: number | string | null;
  weaningAge: number | null;
  createdAt: string;
  event: AnimalEvent;
  cria?: { id: number; code: string; sex: "F" | "M" } | null;
}
