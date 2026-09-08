import type { NextFunction, Request, Response } from 'express';
import { AppError, type ErrorBody } from '../lib/app-error.js';
import { logger } from '../lib/logger.js';

/**
 * Error handler central. Traduce cualquier error a la forma uniforme
 * `{ error: { code, message } }`. Debe registrarse el último.
 */
export function errorHandler(err: unknown, _req: Request, res: Response, next: NextFunction): void {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof AppError) {
    if (err.status >= 500) {
      logger.error({ err, code: err.code }, err.message);
    } else {
      logger.warn({ code: err.code }, err.message);
    }
    const body: ErrorBody = { error: { code: err.code, message: err.message } };
    res.status(err.status).json(body);
    return;
  }

  logger.error({ err }, 'Error no controlado');
  const body: ErrorBody = {
    error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' },
  };
  res.status(500).json(body);
}
