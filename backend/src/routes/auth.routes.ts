import { Router } from 'express';
import { postLogin } from '../controllers/auth.controller.js';

export const authRoutes: Router = Router();

authRoutes.post('/', postLogin);
