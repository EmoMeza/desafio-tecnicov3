import { describe, expect, it } from 'vitest';
import { computeScore } from './score.js';

const RUTS = [
  '12.345.678-5',
  '15.834.966-3',
  '18.765.432-7',
  '7.654.321-6',
  '20.000.003-K',
  '10.000.004-0',
  '11.111.111-1',
  '22.222.222-2',
];

describe('computeScore', () => {
  it('es determinista: mismo RUT, mismo score', () => {
    for (const rut of RUTS) {
      expect(computeScore(rut)).toBe(computeScore(rut));
    }
  });

  it('devuelve un entero en el rango [0, 100]', () => {
    for (const rut of RUTS) {
      const score = computeScore(rut);
      expect(Number.isInteger(score)).toBe(true);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    }
  });

  it('es independiente del formato de entrada', () => {
    expect(computeScore('12.345.678-5')).toBe(computeScore('123456785'));
    expect(computeScore('12345678-5')).toBe(computeScore('12.345.678-5'));
    expect(computeScore('20.000.003-k')).toBe(computeScore('20000003K'));
  });

  it('varía entre RUTs distintos', () => {
    const scores = RUTS.map(computeScore);
    expect(new Set(scores).size).toBeGreaterThan(1);
  });

  it('RUTs consecutivos producen scores distintos', () => {
    expect(computeScore('12.345.678-5')).not.toBe(computeScore('12.345.679-3'));
  });

  it('coincide con los valores de referencia (guard de regresión)', () => {
    expect(computeScore('12.345.678-5')).toBe(8);
    expect(computeScore('15.834.966-3')).toBe(4);
    expect(computeScore('18.765.432-7')).toBe(89);
    expect(computeScore('20.000.003-K')).toBe(93);
  });
});
