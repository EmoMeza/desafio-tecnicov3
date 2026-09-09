import bcrypt from 'bcryptjs';
import { DUMMY_PASSWORD_HASH, findUserByEmail } from '../config/users.js';
import { AppError } from '../lib/app-error.js';
import { signToken } from '../lib/jwt.js';
import type { LoginResponse, TokenPayload } from '../types/auth.js';

/**
 * Valida credenciales mock y devuelve un JWT firmado + los datos del usuario.
 * @throws {AppError} 401 `INVALID_CREDENTIALS` si el email o la contraseña no coinciden.
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  const user = findUserByEmail(email);

  // Siempre se compara contra un hash (real o señuelo) para no filtrar por
  // tiempo de respuesta si el email existe o no.
  const passwordMatches = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_PASSWORD_HASH);

  if (!user || !passwordMatches) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Email o contraseña incorrectos');
  }

  const payload: TokenPayload = { sub: user.sub, role: user.role };
  if (user.role === 'user' && user.rut !== undefined) {
    payload.rut = user.rut;
  }

  return { token: signToken(payload), user: { ...payload } };
}
