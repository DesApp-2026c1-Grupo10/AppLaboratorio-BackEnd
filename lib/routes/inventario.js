import express from 'express';
import {
  getAllEquipos,
  getEquipoById,
  createEquipo,
  updateEquipo,
  removeEquipo,
  getAllMateriales,
  getMaterialById,
  createMaterial,
  updateMaterial,
  removeMaterial,
  getAllReactivos,
  getReactivoById,
  createReactivo,
  updateReactivo,
  removeReactivo,
} from '../controllers/inventario_controller';
import { withErrorHandling } from './utils';
const router = express.Router();
router.get('/equipos', withErrorHandling(getAllEquipos));
router.get('/equipos/:id', withErrorHandling(getEquipoById));
router.post('/equipos', withErrorHandling(createEquipo));
router.put('/equipos/:id', withErrorHandling(updateEquipo));
router.delete('/equipos/:id', withErrorHandling(removeEquipo));
router.get('/materiales', withErrorHandling(getAllMateriales));
router.get('/materiales/:id', withErrorHandling(getMaterialById));
router.post('/materiales', withErrorHandling(createMaterial));
router.put('/materiales/:id', withErrorHandling(updateMaterial));
router.delete('/materiales/:id', withErrorHandling(removeMaterial));
router.get('/reactivos', withErrorHandling(getAllReactivos));
router.get('/reactivos/:id', withErrorHandling(getReactivoById));
router.post('/reactivos', withErrorHandling(createReactivo));
router.put('/reactivos/:id', withErrorHandling(updateReactivo));
router.delete('/reactivos/:id', withErrorHandling(removeReactivo));
export default router;
