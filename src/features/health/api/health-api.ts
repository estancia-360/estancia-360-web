import { apiFetch } from "@/lib/api-client";
import type { HealthIncident, IncidentType, Treatment, Vaccination } from "@/features/health/types";

export interface RegisterVaccinationInput {
  idRanchAnimal: number;
  vaccineName: string;
  dose?: string;
  responsible?: string;
  notes?: string;
  eventDate: string;
}

export function registerVaccination(data: RegisterVaccinationInput, accessToken: string): Promise<{ vaccination: Vaccination }> {
  return apiFetch("/health/vaccination", { method: "POST", body: data, accessToken });
}

export interface RegisterTreatmentInput {
  idRanchAnimal: number;
  illness?: string;
  medication: string;
  dose?: string;
  durationDays?: number;
  withdrawalDays?: number;
  responsible?: string;
  notes?: string;
  eventDate: string;
}

export function registerTreatment(data: RegisterTreatmentInput, accessToken: string): Promise<{ treatment: Treatment }> {
  return apiFetch("/health/treatment", { method: "POST", body: data, accessToken });
}

export interface RegisterHealthIncidentInput {
  idRanchAnimal: number;
  incidentType: IncidentType;
  description?: string;
  notes?: string;
  eventDate: string;
}

export function registerHealthIncident(
  data: RegisterHealthIncidentInput,
  accessToken: string,
): Promise<{ healthIncident: HealthIncident }> {
  return apiFetch("/health/health-incident", { method: "POST", body: data, accessToken });
}
