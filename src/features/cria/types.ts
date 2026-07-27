export type ServiceType = "natural" | "artificial_insemination" | "embryo_transfer";

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  natural: "Monta natural",
  artificial_insemination: "Inseminación artificial",
  embryo_transfer: "Transferencia de embriones",
};

export interface BreedingService {
  id: number;
  idEvent: number;
  idAnimalMale: number | null;
  serviceType: ServiceType;
  semenBreed: string | null;
  technician: string | null;
  reproductiveLot: string | null;
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
