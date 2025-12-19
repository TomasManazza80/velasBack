// routes/enviarPedidoWhatsappRoutes.js - Versión extendida
const express = require('express');
const router = express.Router();
const { crearPedido } = require('../controller/enviarPedidoWhatsappController');
const { verificarEstado, reconectar } = require('../main');

// Ruta POST para enviar pedidos
router.post('/enviar', crearPedido);

// Nueva ruta GET para verificar estado
router.get('/estado', (req, res) => {
    try {
        const estado = verificarEstado();
        res.json({
            success: true,
            estado,
            timestamp: new Date()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Nueva ruta POST para forzar reconexión
router.post('/reconectar', async (req, res) => {
    try {
        const resultado = await reconectar();
        res.json({
            success: resultado.success,
            message: resultado.message || 'Reconexión iniciada',
            timestamp: new Date()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;