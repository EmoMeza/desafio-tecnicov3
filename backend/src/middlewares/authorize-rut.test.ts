import type { Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';
import type { AuthUser } from '../types/auth.js';
import { authorizeRut } from './authorize-rut.js';

function run(user: AuthUser | undefined, rutParam: string): unknown {
  const req = { user, params: { rut: rutParam } } as Request<{ rut: string }>;
  const next = vi.fn<(err?: unknown) => void>();
  authorizeRut(req, {} as Response, next);
  expect(next).toHaveBeenCalledOnce();
  return next.mock.calls[0]?.[0];
}

const admin: AuthUser = { sub: 'usr-admin', role: 'admin' };
const ana: AuthUser = { sub: 'usr-001', role: 'user', rut: '12.345.678-5' };

describe('authorizeRut', () => {
  it('admin puede consultar cualquier RUT', () => {
    expect(run(admin, '15.834.966-3')).toBeUndefined();
  });

  it('user puede consultar su propio RUT', () => {
    expect(run(ana, '12.345.678-5')).toBeUndefined();
  });

  it('la comparación es independiente del formato', () => {
    expect(run(ana, '123456785')).toBeUndefined();
  });

  it('403 FORBIDDEN_RUT si el user consulta otro RUT', () => {
    expect(run(ana, '15.834.966-3')).toMatchObject({ status: 403, code: 'FORBIDDEN_RUT' });
  });

  it('401 si no hay usuario autenticado', () => {
    expect(run(undefined, '12.345.678-5')).toMatchObject({ status: 401 });
  });
});
