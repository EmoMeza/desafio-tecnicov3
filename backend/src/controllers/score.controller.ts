import type { Request, Response } from 'express';
import { formatRut } from '../domain/rut.js';
import { getScore } from '../services/score.service.js';

/** Instante actual en ISO 8601 UTC, truncado a segundos: `2025-06-27T14:35:00Z`. */
function nowIso(): string {
  return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
}

/** `GET /score/:rut` — devuelve el score financiero del RUT. */
export function getScoreByRut(req: Request<{ rut: string }>, res: Response): void {
  const { rut } = req.params;
  const score = getScore(rut);

  res.json({
    rut: formatRut(rut),
    score,
    fecha: nowIso(),
  });
}
