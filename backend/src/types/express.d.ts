import type { AuthUser } from './auth.js';

/**
 * Augmenta `Express.Request` con el usuario autenticado. Lo rellena el middleware
 * `authenticate` a partir del JWT; queda `undefined` en rutas públicas.
 */
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
