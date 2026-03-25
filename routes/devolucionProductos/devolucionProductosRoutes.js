var express = require('express');
var router = express.Router();
var devolucionController = require('../../controller/devolucionProductos/devolucionProductosController');

// --- ENDPOINTS DE LOGÍSTICA REVERSA FEDECELL ---
router.post('/registrarDevolucion', devolucionController.createEntry);
router.get('/historialDevoluciones', devolucionController.getAllEntries);
router.delete('/:id', devolucionController.deleteEntry);

module.exports = router;