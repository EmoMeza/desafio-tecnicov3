/** Tipos compartidos con el backend (`backend/src/types/auth.ts`). */

export type Role = 'admin' | 'user';

export interface AuthUser {
  sub: string;
  role: Role;
  /** Presente solo cuando `role === 'user'`. */
  rut?: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface ScoreResponse {
  rut: string;
  score: number;
  /** ISO 8601 UTC — instante de la consulta. */
  fecha: string;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
  };
}
