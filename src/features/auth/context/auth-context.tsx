import { useCallback, useMemo, useState, type ReactNode } from "react";
import { login as loginRequest } from "@/features/auth/api/auth-api";
import {
  clearStoredSession,
  readStoredSession,
  writeStoredSession,
  type StoredSession,
} from "@/features/auth/lib/session-storage";
import { isAdminRole } from "@/features/auth/lib/roles";
import { AuthContext, type AuthContextValue } from "@/features/auth/context/auth-context-value";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<StoredSession | null>(() => readStoredSession());

  const login = useCallback(async (email: string, password: string) => {
    const response = await loginRequest(email, password);
    const nextSession: StoredSession = {
      accessToken: response.accessToken,
      idUser: response.idUser,
      idRole: response.idRole,
      idRanch: response.idRanch,
    };
    writeStoredSession(nextSession);
    setSession(nextSession);
    return nextSession;
  }, []);

  const logout = useCallback(() => {
    clearStoredSession();
    setSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: session !== null,
      isAdmin: session !== null && isAdminRole(session.idRole),
      login,
      logout,
    }),
    [session, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
