import { createContext } from "react";
import type { StoredSession } from "@/features/auth/lib/session-storage";

export interface AuthContextValue {
  session: StoredSession | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<StoredSession>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
