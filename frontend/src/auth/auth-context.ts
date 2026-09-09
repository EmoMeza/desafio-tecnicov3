import { createContext } from 'react';
import type { AuthUser } from '../types/api';

export interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  /** Autentica contra `POST /login` y persiste la sesión. Propaga `ApiError`. */
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
