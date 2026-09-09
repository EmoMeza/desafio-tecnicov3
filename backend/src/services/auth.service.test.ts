import { describe, expect, it } from 'vitest';
import { AppError } from '../lib/app-error.js';
import { verifyToken } from '../lib/jwt.js';
import { login } from './auth.service.js';

describe('login', () => {
  it('autentica al admin y emite un token sin rut', async () => {
    const { token, user } = await login('admin@riesgo.cl', 'Admin123!');

    expect(user).toEqual({ sub: 'usr-admin', role: 'admin' });
    expect(user.rut).toBeUndefined();
    expect(verifyToken(token)).toMatchObject({ sub: 'usr-admin', role: 'admin' });
  });

  it('autentica a un user y emite un token con su rut', async () => {
    const { token, user } = await login('ana@riesgo.cl', 'Ana123!');

    expect(user).toEqual({ sub: 'usr-001', role: 'user', rut: '12.345.678-5' });
    expect(verifyToken(token)).toMatchObject({ role: 'user', rut: '12.345.678-5' });
  });

  it('normaliza el email (espacios y mayúsculas)', async () => {
    const { user } = await login('  ANA@Riesgo.CL  ', 'Ana123!');
    expect(user.sub).toBe('usr-001');
  });

  it('rechaza una contraseña incorrecta con 401 INVALID_CREDENTIALS', async () => {
    await expect(login('ana@riesgo.cl', 'incorrecta')).rejects.toMatchObject({
      status: 401,
      code: 'INVALID_CREDENTIALS',
    });
  });

  it('rechaza un email inexistente con 401 INVALID_CREDENTIALS', async () => {
    await expect(login('nadie@riesgo.cl', 'loquesea')).rejects.toBeInstanceOf(AppError);
  });
});
