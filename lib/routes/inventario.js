import express from 'express';
import { withErrorHandling } from './utils';

import * as materialController from '../controllers/inventario/material_controller';
import * as reactivoController from '../controllers/inventario/reactivo_controller';
import * as equipoController from '../controllers/inventario/equipo_controller';
import * as movimientoController from '../controllers/inventario/movimiento_controller';
import * as usoEquipoController from '../controllers/inventario/uso_equipo_controller';
import * as sustanciaBasicaController from '../controllers/inventario/sustancia_basica_controller';

const router = express.Router();

// Materiales
router.get('/materiales', withErrorHandling(materialController.getAll));
router.get('/materiales/:id', withErrorHandling(materialController.getById));
router.post('/materiales', withErrorHandling(materialController.create));
router.put('/materiales/:id', withErrorHandling(materialController.update));
router.delete('/materiales/:id', withErrorHandling(materialController.remove));

// Reactivos
router.get('/reactivos', withErrorHandling(reactivoController.getAll));
router.get('/reactivos/:id', withErrorHandling(reactivoController.getById));
router.post('/reactivos', withErrorHandling(reactivoController.create));
router.put('/reactivos/:id', withErrorHandling(reactivoController.update));
router.delete('/reactivos/:id', withErrorHandling(reactivoController.remove));

// Equipos
router.get('/equipos', withErrorHandling(equipoController.getAll));
router.get('/equipos/:id', withErrorHandling(equipoController.getById));
router.post('/equipos', withErrorHandling(equipoController.create));
router.put('/equipos/:id', withErrorHandling(equipoController.update));
router.delete('/equipos/:id', withErrorHandling(equipoController.remove));

// Sustancias Básicas
router.get(
  '/sustancias-basicas',
  withErrorHandling(sustanciaBasicaController.getAll)
);
router.get(
  '/sustancias-basicas/:id',
  withErrorHandling(sustanciaBasicaController.getById)
);
router.post(
  '/sustancias-basicas',
  withErrorHandling(sustanciaBasicaController.create)
);
router.put(
  '/sustancias-basicas/:id',
  withErrorHandling(sustanciaBasicaController.update)
);
router.delete(
  '/sustancias-basicas/:id',
  withErrorHandling(sustanciaBasicaController.remove)
);

// Movimientos de stock
router.get('/movimientos', withErrorHandling(movimientoController.getAll));
router.get('/movimientos/:id', withErrorHandling(movimientoController.getById));
router.post('/movimientos', withErrorHandling(movimientoController.create));
router.delete(
  '/movimientos/:id',
  withErrorHandling(movimientoController.remove)
);

// Usos de equipo
router.get('/usos', withErrorHandling(usoEquipoController.getAll));
router.get('/usos/:id', withErrorHandling(usoEquipoController.getById));
router.post('/usos', withErrorHandling(usoEquipoController.create));
router.put(
  '/usos/:id/finalizar',
  withErrorHandling(usoEquipoController.finalizar)
);
router.delete('/usos/:id', withErrorHandling(usoEquipoController.remove));

export default router;
