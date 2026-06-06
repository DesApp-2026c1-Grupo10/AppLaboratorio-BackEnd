import express from 'express';
import { withErrorHandling } from './utils';
import * as actividadController from '../controllers/actividad_predefinida_controller';

const router = express.Router();

router.get('/', withErrorHandling(actividadController.getAll));
router.get('/:id', withErrorHandling(actividadController.getById));
router.post('/', withErrorHandling(actividadController.create));
router.put('/:id', withErrorHandling(actividadController.update));
router.delete('/:id', withErrorHandling(actividadController.remove));

export default router;
