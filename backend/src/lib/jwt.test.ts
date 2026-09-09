import jwt from 'jsonwebtoken';
import { describe, expect, it } from 'vitest';
import { config } from '../config/index.js';
import type { TokenPayload } from '../types/auth.js';
import { signToken, verifyToken } from './jwt.js';

const userPayload: TokenPayload = { sub: 'usr-001', role: 'user', rut: '12.345.678-5' };
const adminPayload: TokenPayload = { sub: 'usr-admin', role: 'admin' };

describe('signToken / verifyToken', () => {
  it('firma y verifica un token de user conservando el payload', () => {
    const decoded = verifyToken(signToken(userPayload));
    expect(decoded).toMatchObject(userPayload);
  });

  it('un token de admin no incluye rut', () => {
    const decoded = verifyToken(signToken(adminPayload));
    expect(decoded.rut).toBeUndefined();
    expect(decoded.role).toBe('admin');
  });

  it('rechaza un token firmado con otro secreto', () => {
    const foreign = jwt.sign(adminPayload, 'otro-secreto', { algorithm: 'HS256' });
    expect(() => verifyToken(foreign)).toThrow(jwt.JsonWebTokenError);
  });

  it('rechaza un token expirado', () => {
    const expired = jwt.sign(adminPayload, config.JWT_SECRET, { expiresIn: -10 });
    expect(() => verifyToken(expired)).toThrow(jwt.TokenExpiredError);
  });

  it('rechaza un token con payload de forma inválida', () => {
    const bad = jwt.sign({ sub: 'x', role: 'superuser' }, config.JWT_SECRET);
    expect(() => verifyToken(bad)).toThrow();
  });
});
