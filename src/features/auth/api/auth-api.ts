import { apiFetch } from "@/lib/api-client";

export interface LoginResponse {
  message: string;
  accessToken: string;
  idUser: number;
  idRole: number;
  idRanch: number | null;
}

export function login(email: string, password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}
