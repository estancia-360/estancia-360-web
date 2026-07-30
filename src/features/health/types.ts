interface AnimalEvent {
  id: number;
  idRanchAnimal: number;
  idEventType: number;
  notes: string | null;
  isSynced: boolean;
  eventDate: string;
  animal: { id: number; code: string; sex: "F" | "M" };
}

export interface Vaccination {
  id: number;
  idEvent: number;
  vaccineName: string;
  dose: string | null;
  responsible: string | null;
  notes: string | null;
  createdAt: string;
  event: AnimalEvent;
}

export interface Treatment {
  id: number;
  idEvent: number;
  illness: string | null;
  medication: string;
  dose: string | null;
  durationDays: number | null;
  withdrawalDays: number | null;
  withdrawalEndDate: string | null;
  responsible: string | null;
  notes: string | null;
  createdAt: string;
  event: AnimalEvent;
}

export type IncidentType = "illness_detected" | "quarantine";

export const INCIDENT_TYPE_LABELS: Record<IncidentType, string> = {
  illness_detected: "Enfermedad detectada",
  quarantine: "Cuarentena",
};

export interface HealthIncident {
  id: number;
  idEvent: number;
  incidentType: IncidentType;
  description: string | null;
  resolvedAt: string | null;
  notes: string | null;
  createdAt: string;
  event: AnimalEvent;
}
