import express from 'express';
import {
  index,
  show,
  create,
  update,
  remove,
} from '../controllers/pedido_controller';
import { withErrorHandling } from './utils';

const router = express.Router();

router.get('/', withErrorHandling(index));
router.get('/:id', withErrorHandling(show));
router.post('/', withErrorHandling(create));
router.put('/:id', withErrorHandling(update));
router.delete('/:id', withErrorHandling(remove));

export default router;
