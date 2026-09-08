import { describe, expect, it } from 'vitest';
import { AppError } from '../lib/app-error.js';
import { getScore } from './score.service.js';

describe('getScore', () => {
  it('devuelve el score de un RUT válido', () => {
    expect(getScore('12.345.678-5')).toBe(8);
  });

  it('es determinista', () => {
    expect(getScore('15.834.966-3')).toBe(getScore('15.834.966-3'));
  });

  it('lanza AppError 400 INVALID_RUT si el RUT no es válido', () => {
    expect(() => getScore('12.345.678-9')).toThrow(AppError);
    try {
      getScore('no-es-un-rut');
      expect.unreachable('debería haber lanzado');
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).status).toBe(400);
      expect((err as AppError).code).toBe('INVALID_RUT');
    }
  });
});
