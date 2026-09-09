/** Rol del usuario. */
export type Role = 'admin' | 'user';

/**
 * Payload del JWT. `rut` solo está presente cuando `role === 'user'`
 * (un `admin` no está atado a un RUT concreto).
 */
export interface TokenPayload {
  sub: string;
  role: Role;
  rut?: string;
}

/** Datos del usuario que se devuelven al cliente tras el login. */
export interface AuthUser {
  sub: string;
  role: Role;
  rut?: string;
}

/** Cuerpo de la respuesta de `POST /login`. */
export interface LoginResponse {
  token: string;
  user: AuthUser;
}
