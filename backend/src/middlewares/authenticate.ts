import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../lib/app-error.js';
import { verifyToken } from '../lib/jwt.js';

const BEARER_PREFIX = 'Bearer ';

/**
 * Valida el JWT del header `Authorization: Bearer <token>` (firma + expiración) y
 * adjunta el usuario a `req.user`. Falla con 401 `UNAUTHENTICATED`.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (header === undefined || !header.startsWith(BEARER_PREFIX)) {
    next(new AppError(401, 'UNAUTHENTICATED', 'Falta el token de autenticación'));
    return;
  }

  const token = header.slice(BEARER_PREFIX.length).trim();

  try {
    req.user = verifyToken(token);
    next();
  } catch (err) {
    const message =
      err instanceof jwt.TokenExpiredError ? 'El token ha expirado' : 'Token inválido';
    next(new AppError(401, 'UNAUTHENTICATED', message));
  }
}
