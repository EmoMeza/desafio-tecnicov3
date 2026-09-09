/**
 * Utilidades de RUT chileno para el cliente. Réplica de la lógica del backend
 * (`backend/src/domain/rut.ts`): funciones puras, mismo algoritmo módulo 11.
 */

const NORMALIZED_RUT = /^\d{7,8}[0-9K]$/;

/** Quita puntos, guion y espacios; `K` en mayúscula. `"12.345.678-5"` → `"123456785"` */
export function normalizeRut(input: string): string {
  return input.replace(/[.\-\s]/g, '').toUpperCase();
}

function computeDv(body: string): string {
  const sum = body
    .split('')
    .reverse()
    .reduce((acc, digit, index) => acc + Number(digit) * ((index % 6) + 2), 0);

  const remainder = 11 - (sum % 11);
  if (remainder === 11) return '0';
  if (remainder === 10) return 'K';
  return String(remainder);
}

/** Valida formato y dígito verificador (módulo 11). */
export function isValidRut(input: string): boolean {
  const clean = normalizeRut(input);
  if (!NORMALIZED_RUT.test(clean)) return false;

  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  return computeDv(body) === dv;
}

/** Formato canónico `"12.345.678-5"`. */
export function formatRut(input: string): string {
  const clean = normalizeRut(input);
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  const withThousands = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${withThousands}-${dv}`;
}

/**
 * Formatea progresivamente lo que el usuario escribe: descarta caracteres no
 * válidos, limita a 8 dígitos + DV, e inserta puntos y guion.
 */
export function formatRutInput(value: string): string {
  const clean = value
    .replace(/[^0-9kK]/g, '')
    .toUpperCase()
    .slice(0, 9);

  if (clean.length <= 1) return clean;

  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  const withThousands = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${withThousands}-${dv}`;
}
