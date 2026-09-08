import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../lib/app-error.js';

/** Captura cualquier ruta no registrada y la deriva al error handler como 404. */
export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(AppError.notFound(`Ruta no encontrada: ${req.method} ${req.originalUrl}`));
}
