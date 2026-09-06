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
  fullname: string;
  ranches: OwnedRanch[];
}

// /auth/login/web — variante del login pensada para el panel: devuelve todas las
// estancias donde el usuario es Owner (no solo la primera, como /auth/login que
// usa mobile) para que el panel deje elegir con cuál entrar.
export function login(email: string, password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/auth/login/web", {
    method: "POST",
    body: { email, password },
  });
}
