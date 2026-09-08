import pino from 'pino';
import { config } from '../config/index.js';

/**
 * Logger de la aplicación. En desarrollo usa `pino-pretty` para salida legible;
 * en test se silencia; en producción emite NDJSON a stdout.
 */
export const logger = pino({
  level: config.NODE_ENV === 'test' ? 'silent' : 'info',
  ...(config.NODE_ENV === 'development'
    ? {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname' },
        },
      }
    : {}),
});
