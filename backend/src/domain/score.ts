import { normalizeRut } from './rut.js';

/**
 * Score financiero determinista de un RUT: un entero en `[0, 100]`.
 *
 * - **Determinista**: el mismo RUT devuelve siempre el mismo score.
 * - **Sensible**: RUTs distintos tienden a scores distintos.
 * - Sin fechas ni aleatoriedad; no se persiste, se recalcula en cada consulta.
 *
 * Implementación: hash FNV-1a de 32 bits sobre el RUT normalizado, módulo 101.
 */
const FNV_OFFSET_BASIS = 2166136261;
const FNV_PRIME = 16777619;

export function computeScore(rut: string): number {
  const normalized = normalizeRut(rut);

  let hash = FNV_OFFSET_BASIS;
  for (const char of normalized) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, FNV_PRIME);
  }

  return (hash >>> 0) % 101;
}
