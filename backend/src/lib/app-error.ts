/**
 * Códigos de error de negocio expuestos en las respuestas de la API.
 * Ver la tabla de errores en `PLAN.md`.
 */
export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'INVALID_CREDENTIALS'
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN_RUT'
  | 'INVALID_RUT'
  | 'NOT_FOUND'
  | 'INTERNAL_ERROR';

/** Forma uniforme del cuerpo de error de la API. */
export interface ErrorBody {
  error: {
    code: ErrorCode;
    message: string;
  };
}

/**
 * Error de aplicación con status HTTP y código de negocio. El error handler
 * central lo traduce a `{ error: { code, message } }`.
 */
export class AppError extends Error {
  constructor(
    readonly status: number,
    readonly code: ErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }

  static notFound(message = 'Recurso no encontrado'): AppError {
    return new AppError(404, 'NOT_FOUND', message);
  }
}
