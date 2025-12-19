const whatsappService = require('../services/qrService');

// Asegúrate de que el nombre sea EXACTAMENTE este
const getWhatsappStatus = (req, res) => {
    const data = whatsappService.getStatus();
    res.status(200).json(data);
};

const restartWhatsapp = async (req, res) => {
    try {
        await whatsappService.restart();
        res.status(200).json({ message: 'Reiniciando...' });
    } catch (error) {
        res.status(500).json({ error: 'Error al reiniciar' });
    }
};

// MUY IMPORTANTE: Exportar ambos
module.exports = { 
    getWhatsappStatus, 
    restartWhatsapp 
};