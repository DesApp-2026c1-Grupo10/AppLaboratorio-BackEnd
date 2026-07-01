import express from 'express';
import * as controller from '../controllers/usuario_controller';
import { authMiddleware, roleMiddleware } from '../middlewares/auth';

const router = express.Router();

// Login público (sin auth)
router.post('/login', controller.login);

// CRUD protegido
router.get('/', authMiddleware, controller.getAll);
router.get('/:id', authMiddleware, controller.getById);
router.post(
  '/',
  authMiddleware,
  roleMiddleware('Desarrollador'),
  controller.create
);
router.put(
  '/:id',
  authMiddleware,
  (req, res, next) => {
    if (req.user.rol === 'Desarrollador') return next();
    if (req.user.rol === 'Profesor' && Number(req.params.id) === req.user.id)
      return next();
    return res
      .status(403)
      .json({ message: 'No tenés permiso para realizar esta acción' });
  },
  controller.update
);
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('Desarrollador'),
  controller.remove
);

export default router;
