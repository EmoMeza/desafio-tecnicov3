import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { signToken } from '../lib/jwt.js';
import type { Role } from '../types/auth.js';

interface TokenOptions {
  sub?: string;
  role?: Role;
  rut?: string;
}

/** Genera un JWT válido para los tests. Por defecto: `user` con RUT `12.345.678-5`. */
export function makeToken(options: TokenOptions = {}): string {
  const role = options.role ?? 'user';
  const sub = options.sub ?? `usr-${role}`;

  return role === 'user'
    ? signToken({ sub, role, rut: options.rut ?? '12.345.678-5' })
    : signToken({ sub, role });
}

/** Genera un JWT ya expirado (para probar el rechazo por expiración). */
export function makeExpiredToken(): string {
  return jwt.sign({ sub: 'usr-001', role: 'user', rut: '12.345.678-5' }, config.JWT_SECRET, {
    expiresIn: -10,
  });
}
