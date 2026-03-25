var express = require('express');
var router = express.Router();
var egressController = require('../../controller/balance/egresosController');

router.post('/egress', egressController.createEgress);
router.get('/egress', egressController.getAllEgresses);
router.delete('/egress/:id', egressController.deleteEgress);
router.get('/responsables', egressController.getResponsables); // Nueva ruta para el catálogo

module.exports = router;