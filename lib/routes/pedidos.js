import express from 'express';
import {
  getAll,
  getById,
  create,
  update,
  remove,
  aprobar,
  rechazar,
  finalizar,
  getHistorial,
} from '../controllers/pedido_controller';
import { getTareas, toggleTarea } from '../controllers/tarea_controller';
import { withErrorHandling } from './utils';

const router = express.Router();

router.get('/', withErrorHandling(getAll));
router.get('/:id', withErrorHandling(getById));
router.post('/', withErrorHandling(create));
router.put('/:id', withErrorHandling(update));
router.delete('/:id', withErrorHandling(remove));

router.put('/:id/aprobar', withErrorHandling(aprobar));
router.put('/:id/rechazar', withErrorHandling(rechazar));
router.put('/:id/finalizar', withErrorHandling(finalizar));
router.get('/:id/historial', withErrorHandling(getHistorial));
router.get('/:id/tareas', withErrorHandling(getTareas));
router.put('/:id/tareas/:tareaId', withErrorHandling(toggleTarea));

export default router;
