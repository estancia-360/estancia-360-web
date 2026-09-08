import { apiFetch } from "@/lib/api-client";
import type { RanchMember } from "@/features/ranch/types/members";

export function getRanchMembers(idRanch: number, accessToken: string): Promise<{ members: RanchMember[] }> {
  return apiFetch(`/ranch-users/ranch/${idRanch}`, { accessToken });
}

export interface RegisterRanchMemberInput {
  ci: string;
  fullname: string;
  paternalSurname: string;
  maternalSurname: string;
  email: string;
  password: string;
  celphone?: string;
}

export function registerRanchMember(idRanch: number, data: RegisterRanchMemberInput, accessToken: string): Promise<{ member: unknown }> {
  return apiFetch(`/ranch-users/ranch/${idRanch}/members`, { method: "POST", body: data, accessToken });
}

export function removeRanchMember(idRanch: number, idTargetUser: number, accessToken: string): Promise<void> {
  return apiFetch(`/ranch-users/ranch/${idRanch}/members/${idTargetUser}`, { method: "DELETE", accessToken });
}
