import type { Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';
import { AppError } from '../lib/app-error.js';
import { errorHandler } from './error-handler.js';

function mockRes(headersSent = false): Response {
  const res = { headersSent, json: vi.fn() } as unknown as Response;
  res.status = vi.fn(() => res);
  return res;
}

describe('errorHandler', () => {
  it('traduce un AppError a { error: { code, message } } con su status', () => {
    const res = mockRes();
    errorHandler(new AppError(403, 'FORBIDDEN_RUT', 'nope'), {} as Request, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: { code: 'FORBIDDEN_RUT', message: 'nope' } });
  });

  it('convierte un error desconocido en 500 INTERNAL_ERROR', () => {
    const res = mockRes();
    errorHandler(new Error('boom'), {} as Request, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' },
    });
  });

  it('maneja un AppError con status >= 500', () => {
    const res = mockRes();
    errorHandler(new AppError(503, 'INTERNAL_ERROR', 'caído'), {} as Request, res, vi.fn());
    expect(res.status).toHaveBeenCalledWith(503);
  });

  it('delega en next(err) si la respuesta ya se envió', () => {
    const res = mockRes(true);
    const next = vi.fn<(err?: unknown) => void>();
    const original = new Error('x');
    errorHandler(original, {} as Request, res, next);

    expect(next).toHaveBeenCalledWith(original);
    expect(res.json).not.toHaveBeenCalled();
  });
});
