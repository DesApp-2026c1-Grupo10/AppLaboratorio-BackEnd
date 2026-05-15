import express from 'express';
import {
  getAll,
  getById,
  create,
  update,
  remove,
  disponibilidad,
} from '../controllers/laboratorio_controller';
import { withErrorHandling } from './utils';

const router = express.Router();

router.get('/', withErrorHandling(getAll));
router.get('/:id/disponibilidad', withErrorHandling(disponibilidad));
router.get('/:id', withErrorHandling(getById));
router.post('/', withErrorHandling(create));
router.put('/:id', withErrorHandling(update));
router.delete('/:id', withErrorHandling(remove));

export default router;
