import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, onUnauthorized } from '../lib/api';
import { clearSession, loadSession, saveSession, type StoredSession } from '../lib/storage';
import { AuthContext, type AuthContextValue } from './auth-context';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<StoredSession | null>(loadSession);

  const logout = useCallback(() => {
    setSession(null);
    clearSession();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token, user } = await api.login(email, password);
    const next: StoredSession = { token, user };
    setSession(next);
    saveSession(next);
  }, []);

  // Una petición autenticada que recibe 401 cierra la sesión.
  useEffect(() => {
    onUnauthorized(logout);
  }, [logout]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      isAuthenticated: session !== null,
      login,
      logout,
    }),
    [session, login, logout],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
