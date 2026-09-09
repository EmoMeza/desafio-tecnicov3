import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from './app.js';
import { makeExpiredToken, makeToken } from './test/helpers.js';
import type { LoginResponse } from './types/auth.js';

const app = createApp();

async function loginAs(email: string, password: string): Promise<LoginResponse> {
  const res = await request(app).post('/login').send({ email, password });
  expect(res.status).toBe(200);
  return res.body as LoginResponse;
}

describe('GET /health', () => {
  it('responde 200 con status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'ok' });
  });
});

describe('POST /login', () => {
  it('200 y token sin rut para admin', async () => {
    const res = await request(app)
      .post('/login')
      .send({ email: 'admin@riesgo.cl', password: 'Admin123!' });

    expect(res.status).toBe(200);
    expect(res.body.user).toEqual({ sub: 'usr-admin', role: 'admin' });
    expect(typeof res.body.token).toBe('string');
  });

  it('200 y token con rut para user', async () => {
    const res = await request(app)
      .post('/login')
      .send({ email: 'ana@riesgo.cl', password: 'Ana123!' });

    expect(res.status).toBe(200);
    expect(res.body.user).toEqual({ sub: 'usr-001', role: 'user', rut: '12.345.678-5' });
  });

  it('401 INVALID_CREDENTIALS con contraseña incorrecta', async () => {
    const res = await request(app)
      .post('/login')
      .send({ email: 'ana@riesgo.cl', password: 'mala' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('400 VALIDATION_ERROR con body inválido', async () => {
    const res = await request(app).post('/login').send({ email: 'no-es-email' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('GET /score/:rut', () => {
  const OWN_RUT = '12.345.678-5';
  const OTHER_RUT = '15.834.966-3';

  it('401 UNAUTHENTICATED sin token', async () => {
    const res = await request(app).get(`/score/${OWN_RUT}`);
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHENTICATED');
  });

  it('401 UNAUTHENTICATED con token expirado', async () => {
    const res = await request(app)
      .get(`/score/${OWN_RUT}`)
      .set('Authorization', `Bearer ${makeExpiredToken()}`);

    expect(res.status).toBe(401);
    expect(res.body.error.message).toMatch(/expirad/i);
  });

  it('200 cuando un user consulta su propio RUT', async () => {
    const { token } = await loginAs('ana@riesgo.cl', 'Ana123!');
    const res = await request(app).get(`/score/${OWN_RUT}`).set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ rut: OWN_RUT, score: expect.any(Number) });
    expect(res.body.score).toBeGreaterThanOrEqual(0);
    expect(res.body.score).toBeLessThanOrEqual(100);
    expect(typeof res.body.fecha).toBe('string');
  });

  it('acepta el RUT en cualquier formato (mismo score)', async () => {
    const token = makeToken({ role: 'user', rut: OWN_RUT });
    const conFormato = await request(app)
      .get(`/score/${OWN_RUT}`)
      .set('Authorization', `Bearer ${token}`);
    const sinFormato = await request(app)
      .get('/score/123456785')
      .set('Authorization', `Bearer ${token}`);

    expect(sinFormato.status).toBe(200);
    expect(sinFormato.body.score).toBe(conFormato.body.score);
    expect(sinFormato.body.rut).toBe(OWN_RUT);
  });

  it('403 FORBIDDEN_RUT cuando un user consulta otro RUT', async () => {
    const { token } = await loginAs('ana@riesgo.cl', 'Ana123!');
    const res = await request(app)
      .get(`/score/${OTHER_RUT}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN_RUT');
  });

  it('200 cuando un admin consulta cualquier RUT', async () => {
    const { token } = await loginAs('admin@riesgo.cl', 'Admin123!');
    const res = await request(app)
      .get(`/score/${OTHER_RUT}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.rut).toBe(OTHER_RUT);
  });

  it('400 INVALID_RUT con un RUT mal formado (admin)', async () => {
    const token = makeToken({ role: 'admin' });
    const res = await request(app)
      .get('/score/12.345.678-9')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_RUT');
  });
});

describe('rutas desconocidas', () => {
  it('404 NOT_FOUND', async () => {
    const res = await request(app).get('/no-existe');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
