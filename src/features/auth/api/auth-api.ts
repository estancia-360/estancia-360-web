import { apiFetch } from "@/lib/api-client";

export interface OwnedRanch {
  id: number;
  name: string;
}

export interface LoginResponse {
  message: string;
  accessToken: string;
  idUser: number;
  idRole: number;
  ranches: OwnedRanch[];
}

export function login(email: string, password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}
