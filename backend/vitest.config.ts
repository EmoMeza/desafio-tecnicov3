import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // Entorno determinista para los tests (no depende de un .env local).
    env: {
      NODE_ENV: 'test',
      JWT_SECRET: 'test-secret-para-vitest',
      JWT_EXPIRES_IN: '15m',
      CORS_ORIGIN: 'http://localhost:5173',
    },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/test/**',
        'src/server.ts', // bootstrap (listen + señales), se prueba a mano
        'src/config/**', // carga de env con efecto colateral process.exit
        'src/lib/logger.ts', // configuración de pino
        'src/types/**',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
