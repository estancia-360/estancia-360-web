import type { OwnedRanch } from "@/features/auth/api/auth-api";

export interface StoredSession {
  accessToken: string;
  idUser: number;
  idRole: number;
  fullname: string;
  ranches: OwnedRanch[];
}

const STORAGE_KEY = "estancia360.session";

export function readStoredSession(): StoredSession | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredSession;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function writeStoredSession(session: StoredSession): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredSession(): void {
  localStorage.removeItem(STORAGE_KEY);
}
