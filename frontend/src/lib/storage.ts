import type { AuthUser } from '../types/api';

const SESSION_KEY = 'riesgo.session';

export interface StoredSession {
  token: string;
  user: AuthUser;
}

/** Lee la sesión persistida. Devuelve `null` si no hay o si `localStorage` falla. */
export function loadSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw === null) return null;
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}

export function saveSession(session: StoredSession): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // Almacenamiento no disponible (modo privado, cuota, etc.): la sesión
    // seguirá viva en memoria durante esta pestaña.
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // no-op
  }
}
