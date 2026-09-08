import { Router } from 'express';
import { getScoreByRut } from '../controllers/score.controller.js';

export const scoreRoutes: Router = Router();

scoreRoutes.get('/:rut', getScoreByRut);
