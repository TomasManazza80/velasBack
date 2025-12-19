const express = require('express');
const router = express.Router();
const whatsappController = require('../controller/qrController');

// Línea 6
router.get('/status', whatsappController.getWhatsappStatus);

// Línea 7 - REVISA QUE ESTO NO SEA UNDEFINED
router.post('/restart', whatsappController.restartWhatsapp); 

module.exports = router;