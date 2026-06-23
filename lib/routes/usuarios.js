import express from 'express';
import * as controller from '../controllers/usuario_controller';
import { roleMiddleware } from '../middlewares/auth';

const router = express.Router();

// Login público
router.post('/login', controller.login);

// CRUD - auth ya está en app.js
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', roleMiddleware('Desarrollador'), controller.create);
router.put('/:id', roleMiddleware('Desarrollador'), controller.update);
router.delete('/:id', roleMiddleware('Desarrollador'), controller.remove);

export default router;
