import 'dotenv/config';
import { z } from 'zod';

/**
 * Esquema del entorno. La app no arranca si falta o es inválida alguna variable
 * obligatoria (p. ej. `JWT_SECRET`).
 */
const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  JWT_SECRET: z
    .string({ error: 'JWT_SECRET es obligatorio (define la variable de entorno)' })
    .min(1, 'JWT_SECRET no puede estar vacío'),
  JWT_EXPIRES_IN: z.string().min(1).default('15m'),
  CORS_ORIGIN: z.string().min(1).default('http://localhost:5173'),
});

export type Config = z.infer<typeof EnvSchema>;

function loadConfig(): Config {
  const parsed = EnvSchema.safeParse(process.env);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join('.') || '(raíz)'}: ${issue.message}`)
      .join('\n');
    console.error(`Configuración de entorno inválida:\n${issues}`);
    process.exit(1);
  }

  return parsed.data;
}

export const config = loadConfig();
