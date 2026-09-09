import { Router } from 'express';
import { getScoreByRut } from '../controllers/score.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorizeRut } from '../middlewares/authorize-rut.js';

export const scoreRoutes: Router = Router();

scoreRoutes.get('/:rut', authenticate, authorizeRut, getScoreByRut);
