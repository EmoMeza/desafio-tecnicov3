import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { describe, expect, it, vi } from 'vitest';
import { config } from '../config/index.js';
import { AppError } from '../lib/app-error.js';
import { signToken } from '../lib/jwt.js';
import { authenticate } from './authenticate.js';

function run(authorization?: string): { req: Request; nextArg: unknown } {
  const req = { headers: authorization === undefined ? {} : { authorization } } as Request;
  const next = vi.fn<(err?: unknown) => void>();
  authenticate(req, {} as Response, next);
  expect(next).toHaveBeenCalledOnce();
  return { req, nextArg: next.mock.calls[0]?.[0] };
}

const validToken = signToken({ sub: 'usr-001', role: 'user', rut: '12.345.678-5' });

describe('authenticate', () => {
  it('adjunta req.user y llama next() sin error con un token válido', () => {
    const { req, nextArg } = run(`Bearer ${validToken}`);
    expect(nextArg).toBeUndefined();
    expect(req.user).toMatchObject({ sub: 'usr-001', role: 'user', rut: '12.345.678-5' });
  });

  it('401 UNAUTHENTICATED si falta el header', () => {
    expect(run().nextArg).toMatchObject({ status: 401, code: 'UNAUTHENTICATED' });
  });

  it('401 si el header no usa el esquema Bearer', () => {
    expect(run(`Token ${validToken}`).nextArg).toBeInstanceOf(AppError);
  });

  it('401 con mensaje de expiración si el token expiró', () => {
    const expired = jwt.sign({ sub: 'x', role: 'user' }, config.JWT_SECRET, { expiresIn: -5 });
    const err = run(`Bearer ${expired}`).nextArg;
    expect(err).toMatchObject({ status: 401 });
    expect((err as AppError).message).toMatch(/expirad/i);
  });

  it('401 con un token corrupto', () => {
    expect(run('Bearer no-es-un-jwt').nextArg).toMatchObject({ code: 'UNAUTHENTICATED' });
  });
});
