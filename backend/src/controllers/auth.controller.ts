import type { Request, Response } from 'express';
import { z } from 'zod';
import { AppError } from '../lib/app-error.js';
import { login } from '../services/auth.service.js';

const LoginSchema = z.object({
  email: z.email('Email inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

/** `POST /login` — credenciales mock → `{ token, user }`. */
export async function postLogin(req: Request, res: Response): Promise<void> {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Datos de entrada inválidos');
  }

  const { email, password } = parsed.data;
  const result = await login(email, password);
  res.status(200).json(result);
}
