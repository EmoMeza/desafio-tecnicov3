import type { Role } from '../types/auth.js';

/**
 * Usuarios mock. No hay persistencia (lo pide el enunciado): viven en memoria.
 * Las contraseñas se guardan **hasheadas con bcrypt**, nunca en texto plano.
 *
 * Credenciales de prueba (documentadas para el evaluador):
 *   admin@riesgo.cl / Admin123!   → admin (sin RUT)
 *   ana@riesgo.cl   / Ana123!     → user  · 12.345.678-5
 *   bruno@riesgo.cl / Bruno123!   → user  · 15.834.966-3
 */
export interface MockUser {
  sub: string;
  email: string;
  passwordHash: string;
  role: Role;
  rut?: string;
}

export const MOCK_USERS: readonly MockUser[] = [
  {
    sub: 'usr-admin',
    email: 'admin@riesgo.cl',
    passwordHash: '$2b$10$UcnDzdR3bOXqCZDVjjK/IuXyNYGec78HA2y7nry92mfNWB1r1tgKa',
    role: 'admin',
  },
  {
    sub: 'usr-001',
    email: 'ana@riesgo.cl',
    passwordHash: '$2b$10$fTHyOlx.gR6DkZn8dXDXsev7I7LfkN0kh2tSIO7wM6uyefUVmlQ46',
    role: 'user',
    rut: '12.345.678-5',
  },
  {
    sub: 'usr-002',
    email: 'bruno@riesgo.cl',
    passwordHash: '$2b$10$swh9bfM1gZA1Yn42450ac.Yc8ssUs4C5.D10vZPfLk08uJL1.e3dC',
    role: 'user',
    rut: '15.834.966-3',
  },
];

/**
 * Hash de una contraseña aleatoria. Se compara contra este valor cuando el email
 * no existe, para que el tiempo de respuesta sea constante y no se pueda enumerar
 * usuarios por diferencias de latencia.
 */
export const DUMMY_PASSWORD_HASH = '$2b$10$oQIiTiWrRkjoezgBa77gRuum5wXs1Cfiz3w98oPfhUfPDCRhA7V/K';

export function findUserByEmail(email: string): MockUser | undefined {
  const normalized = email.trim().toLowerCase();
  return MOCK_USERS.find((user) => user.email === normalized);
}
