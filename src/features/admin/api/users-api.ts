import { apiFetch } from "@/lib/api-client";
import type { AdminUser } from "@/features/admin/types/users";

export function getAdminUsers(accessToken: string): Promise<{ users: AdminUser[] }> {
  return apiFetch("/admin/users", { accessToken });
}

export interface CreateAdminUserInput {
  ci: string;
  fullname: string;
  paternalSurname: string;
  maternalSurname: string;
  email: string;
  password: string;
  celphone?: string;
}

export function createAdminUser(data: CreateAdminUserInput, accessToken: string): Promise<{ user: AdminUser }> {
  return apiFetch("/admin/users", {
    method: "POST",
    body: data,
    accessToken,
  });
}
