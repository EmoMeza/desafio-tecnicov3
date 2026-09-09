import jwt, { type SignOptions } from 'jsonwebtoken';
import { z } from 'zod';
import { config } from '../config/index.js';
import type { TokenPayload } from '../types/auth.js';

const ALGORITHM = 'HS256' as const;

/** Valida la forma del payload decodificado del token. */
const TokenPayloadSchema = z.object({
  sub: z.string().min(1),
  role: z.enum(['admin', 'user']),
  rut: z.string().min(1).optional(),
});

/** Firma un JWT (`HS256`) con expiración tomada de `JWT_EXPIRES_IN`. */
export function signToken(payload: TokenPayload): string {
  const options: SignOptions = {
    algorithm: ALGORITHM,
    expiresIn: config.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, config.JWT_SECRET, options);
}

/**
 * Verifica firma y expiración y devuelve el payload tipado.
 * @throws {jwt.TokenExpiredError | jwt.JsonWebTokenError} si el token no es válido.
 * @throws {Error} si el payload no tiene la forma esperada.
 */
export function verifyToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, config.JWT_SECRET, { algorithms: [ALGORITHM] });
  return TokenPayloadSchema.parse(decoded);
}
