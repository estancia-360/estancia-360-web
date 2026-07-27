export interface AnimalClass {
  id: number;
  name: string;
  sex: "F" | "M";
  isActive: boolean;
}

export interface AnimalBreed {
  id: number;
  name: string;
  isActive: boolean;
}

export interface RanchLot {
  id: number;
  idRanch: number;
  idRanchPasture: number;
  name: string;
  lotType: "cria" | "recria" | "engorde" | "reproductiva" | "general";
  capacity: number | null;
  isActive: boolean;
}

export interface RanchAnimal {
  id: number;
  idProductiveStatus: number | null;
  idLot: number | null;
  idMother: number | null;
  idFather: number | null;
  code: string;
  status: { id: number; name: string };
  breed: { id: number; name: string };
  animalClass: { id: number; name: string; sex: "F" | "M"; isActive: boolean };
  birthdate: string;
  weight: string | number | null;
  sex: "F" | "M";
  createdAt: string;
}

export const PRODUCTIVE_STATUS_LABELS: Record<number, string> = {
  1: "Cría",
  2: "Recría",
  3: "Engorde",
  4: "Baja",
};
