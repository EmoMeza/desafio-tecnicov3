import type { Request, Response } from 'express';

/** `GET /health` — healthcheck para Docker / CI y verificación manual. */
export function getHealth(_req: Request, res: Response): void {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
}
