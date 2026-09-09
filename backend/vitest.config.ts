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
  },
});
