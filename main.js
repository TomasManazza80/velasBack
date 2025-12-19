// main.js
const qrService = require('./services/qrService');

const inicializarWhatsApp = (io) => {
    // IMPORTANTE: Iniciamos el servicio (ahora será Baileys)
    qrService.init();

    io.on('connection', (socket) => {
        console.log('👤 [Socket] Cliente conectado al panel');
        
        // Enviar estado actual al conectar
        socket.emit('whatsapp-status', qrService.getStatus());
    });
};

const enviarPedido = async (datos) => {
    const sock = qrService.getSocket();
    if (!sock) return console.log("❌ No hay conexión de WhatsApp");

    // Lógica de envío (Baileys)
    const numeroDestino = '5493425937358@s.whatsapp.net';
    const { nombre, totalPagado } = datos;
    const mensaje = `🛍️ *NUEVO PEDIDO*\n👤 Cliente: ${nombre}\n💰 Total: $${totalPagado}`;

    try {
        await sock.sendMessage(numeroDestino, { text: mensaje });
        console.log("✅ Mensaje enviado");
    } catch (err) {
        console.error("❌ Error enviando:", err);
    }
};

// ESTA PARTE ES LA QUE EVITA EL ERROR EN bin/www
module.exports = {
    inicializarWhatsApp,
    enviarPedido
};