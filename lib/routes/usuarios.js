const express = require('express');
const router = express.Router();
const controller = require('../controllers/usuario_controller');

// --- RUTA DE LOGIN ---
router.post('/login', controller.login);

// --- RUTAS CRUD NORMALES ---
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
