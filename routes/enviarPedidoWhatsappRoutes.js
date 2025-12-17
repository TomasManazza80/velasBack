const express = require('express');
const router = express.Router();
const pedidoController = require('../controller/enviarPedidoWhatsappController');

// Definir la ruta POST
router.post('/enviar', pedidoController.crearPedido);

module.exports = router;