import { describe, expect, it } from 'vitest';
import { formatRut, isValidRut, normalizeRut } from './rut.js';

describe('normalizeRut', () => {
  it('quita puntos, guion y espacios', () => {
    expect(normalizeRut('12.345.678-5')).toBe('123456785');
    expect(normalizeRut('12345678-5')).toBe('123456785');
    expect(normalizeRut('  12.345.678 - 5 ')).toBe('123456785');
  });

  it('pasa la K a mayúscula', () => {
    expect(normalizeRut('20.000.003-k')).toBe('20000003K');
  });
});

describe('isValidRut', () => {
  it.each([
    '12.345.678-5',
    '12345678-5',
    '123456785',
    '15.834.966-3',
    '18.765.432-7',
    '7.654.321-6', // cuerpo de 7 dígitos
    '20.000.003-K', // DV = K
    '10.000.004-0', // DV = 0
    '20.000.003-k', // DV en minúscula
  ])('acepta un RUT válido: %s', (rut) => {
    expect(isValidRut(rut)).toBe(true);
  });

  it('rechaza el ejemplo del enunciado 12.345.678-9 (DV correcto es 5)', () => {
    expect(isValidRut('12.345.678-9')).toBe(false);
  });

  it.each([
    ['', 'vacío'],
    ['   ', 'solo espacios'],
    ['abcdef', 'no numérico'],
    ['1234567', 'demasiado corto'],
    ['12.345.678', 'sin dígito verificador'],
    ['123456785555', 'demasiado largo'],
    ['15.834.966-1', 'DV incorrecto'],
    ['12.345.678-X', 'DV inválido (X)'],
  ])('rechaza %s (%s)', (rut) => {
    expect(isValidRut(rut)).toBe(false);
  });

  it('es independiente del formato de entrada', () => {
    expect(isValidRut('123456785')).toBe(isValidRut('12.345.678-5'));
  });
});

describe('formatRut', () => {
  it('devuelve el formato canónico con puntos y guion', () => {
    expect(formatRut('123456785')).toBe('12.345.678-5');
    expect(formatRut('12345678-5')).toBe('12.345.678-5');
    expect(formatRut('12.345.678-5')).toBe('12.345.678-5');
  });

  it('formatea cuerpos de 7 dígitos', () => {
    expect(formatRut('76543216')).toBe('7.654.321-6');
  });

  it('conserva el DV K en mayúscula', () => {
    expect(formatRut('20000003-k')).toBe('20.000.003-K');
  });
});
