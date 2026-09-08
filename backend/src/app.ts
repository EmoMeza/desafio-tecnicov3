import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { config } from './config/index.js';
import { logger } from './lib/logger.js';
import { errorHandler } from './middlewares/error-handler.js';
import { notFoundHandler } from './middlewares/not-found.js';
import { healthRoutes } from './routes/health.routes.js';

/**
 * Crea y configura la instancia de Express (sin `listen`), de forma que pueda
 * probarse con Supertest. El arranque real vive en `server.ts`.
 */
export function createApp(): Express {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: config.CORS_ORIGIN }));
  app.use(express.json());
  app.use(pinoHttp({ logger }));

  app.use('/health', healthRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
