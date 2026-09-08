import { computeScore } from '../domain/score.js';
import { isValidRut } from '../domain/rut.js';
import { AppError } from '../lib/app-error.js';

/**
 * Valida el RUT y devuelve su score financiero determinista.
 * @throws {AppError} 400 `INVALID_RUT` si el RUT no es válido.
 */
export function getScore(rut: string): number {
  if (!isValidRut(rut)) {
    throw new AppError(400, 'INVALID_RUT', 'El RUT ingresado no es válido');
  }

  return computeScore(rut);
}
