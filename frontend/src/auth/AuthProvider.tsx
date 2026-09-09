import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, onUnauthorized } from '../lib/api';
import { clearSession, loadSession, saveSession, type StoredSession } from '../lib/storage';
import { AuthContext, type AuthContextValue } from './auth-context';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<StoredSession | null>(loadSession);
  const [sessionExpired, setSessionExpired] = useState(false);

  const logout = useCallback(() => {
    setSession(null);
    setSessionExpired(false);
    clearSession();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token, user } = await api.login(email, password);
    const next: StoredSession = { token, user };
    setSession(next);
    setSessionExpired(false);
    saveSession(next);
  }, []);

  // Una petición autenticada que recibe 401: se cierra la sesión y se marca
  // como expirada para avisar en la pantalla de acceso.
  useEffect(() => {
    onUnauthorized(() => {
      setSession(null);
      clearSession();
      setSessionExpired(true);
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      isAuthenticated: session !== null,
      sessionExpired,
      login,
      logout,
    }),
    [session, sessionExpired, login, logout],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
