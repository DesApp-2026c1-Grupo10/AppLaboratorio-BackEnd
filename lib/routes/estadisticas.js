import express from 'express';
import { getResumen } from '../controllers/estadisticas_controller';
import { withErrorHandling } from './utils';

const router = express.Router();

router.get('/', withErrorHandling(getResumen));

export default router;
