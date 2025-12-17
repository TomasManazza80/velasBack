// controller/enviarPedidoWhatsappController.js
const { enviarPedido } = require('../main'); 

const crearPedido = async (req, res) => {
    try {
        await enviarPedido(req.body);
        res.status(201).json({ success: true, message: 'Pedido enviado.' });
    } catch (error) {
        console.error('Error en pedidoController:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = { crearPedido };