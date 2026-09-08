import { createApp } from './app.js';
import { config } from './config/index.js';
import { logger } from './lib/logger.js';

const app = createApp();

const server = app.listen(config.PORT, () => {
  logger.info(`Backend escuchando en http://localhost:${config.PORT} (${config.NODE_ENV})`);
});

function shutdown(signal: string): void {
  logger.info(`${signal} recibido — cerrando servidor`);
  server.close(() => {
    logger.info('Servidor cerrado');
    process.exit(0);
  });
}

process.on('SIGTERM', () => {
  shutdown('SIGTERM');
});
process.on('SIGINT', () => {
  shutdown('SIGINT');
});
