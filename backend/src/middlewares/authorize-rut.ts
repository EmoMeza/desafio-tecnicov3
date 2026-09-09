import type { NextFunction, Request, Response } from 'express';
import { normalizeRut } from '../domain/rut.js';
import { AppError } from '../lib/app-error.js';

/**
 * Autoriza el acceso a `/score/:rut`:
 * - `admin` puede consultar cualquier RUT.
 * - `user` solo puede consultar el RUT de su token (comparación independiente del formato).
 *
 * Debe encadenarse después de `authenticate`.
 */
export function authorizeRut(
  req: Request<{ rut: string }>,
  _res: Response,
  next: NextFunction,
): void {
  const { user } = req;

  if (!user) {
    next(new AppError(401, 'UNAUTHENTICATED', 'No autenticado'));
    return;
  }

  if (user.role === 'admin') {
    next();
    return;
  }

  const ownsRut = user.rut !== undefined && normalizeRut(req.params.rut) === normalizeRut(user.rut);

  if (ownsRut) {
    next();
    return;
  }

  next(new AppError(403, 'FORBIDDEN_RUT', 'Solo puedes consultar tu propio RUT'));
}
