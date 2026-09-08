/**
 * Utilidades de dominio para el RUT chileno. Funciones puras, sin dependencias
 * de Express ni de infraestructura.
 *
 * Formas de entrada aceptadas (cuerpo de 7-8 dígitos + dígito verificador):
 *   "12.345.678-5"  ·  "12345678-5"  ·  "123456785"
 */

/** Cuerpo numérico (7-8 dígitos) seguido del DV (dígito o `K`), ya normalizado. */
const NORMALIZED_RUT = /^\d{7,8}[0-9K]$/;

/**
 * Quita puntos, guion y espacios, y pasa la `K` a mayúscula.
 * `"12.345.678-5"` → `"123456785"`
 */
export function normalizeRut(input: string): string {
  return input.replace(/[.\-\s]/g, '').toUpperCase();
}

/** Calcula el dígito verificador (módulo 11) del cuerpo numérico dado. */
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

/** Valida el formato y el dígito verificador (módulo 11). */
export function isValidRut(input: string): boolean {
  if (typeof input !== 'string') return false;

  const clean = normalizeRut(input);
  if (!NORMALIZED_RUT.test(clean)) return false;

  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  return computeDv(body) === dv;
}

/**
 * Devuelve el RUT en su formato canónico `"12.345.678-5"`.
 * Asume una entrada con cuerpo + DV; el llamador debe validar antes con
 * {@link isValidRut} si el origen no es de confianza.
 */
export function formatRut(input: string): string {
  const clean = normalizeRut(input);
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  const withThousands = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${withThousands}-${dv}`;
}
