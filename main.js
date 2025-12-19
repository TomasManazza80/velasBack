// main.js
const qrService = require('./services/qrService');

const inicializarWhatsApp = (io) => {
    qrService.init();
    io.on('connection', (socket) => {
        console.log('👤 [Socket] Cliente conectado al panel');
        socket.emit('whatsapp-status', qrService.getStatus());
    });
};

const enviarPedido = async (datos) => {
    const sock = qrService.getSocket();
    if (!sock) return console.log("❌ No hay conexión de WhatsApp");

    // 1. Desestructuramos los datos del body de ejemplo
    const { 
        nombre, 
        celular, 
        opcionEnvio, 
        calleDireccion, 
        ciudad, 
        provincia, 
        costoEnvio, 
        totalPagado, 
        productos 
    } = datos;

    // 2. Formateamos la lista de productos
    const listaProductos = productos.map(p => 
        `- ${p.cantidad}x ${p.nombre} ($${p.precio})`
    ).join('\n');

    // 3. Construimos el mensaje dinámico
    let mensaje = `🛍️ *NUEVO PEDIDO CONFIRMADO*\n\n`;
    mensaje += `👤 *Cliente:* ${nombre}\n`;
    mensaje += `📱 *Teléfono:* ${celular}\n`;
    mensaje += `\n📦 *Detalle del Pedido:*\n${listaProductos}\n`;
    mensaje += `\n🚚 *Método de entrega:* ${opcionEnvio}\n`;

    // Si es envío a domicilio, agregamos la dirección
    if (opcionEnvio === "Envío a domicilio") {
        mensaje += `📍 *Dirección:* ${calleDireccion}, ${ciudad}, ${provincia}\n`;
    }

    mensaje += `\n💰 *Costo Envío:* $${costoEnvio}\n`;
    mensaje += `💵 *TOTAL PAGADO:* $${totalPagado}\n\n`;
    mensaje += `🚀 _Pedido procesado automáticamente_`;

    try {
        // 4. Formatear el número (asegurarse de que termine en @s.whatsapp.net)
        // Usamos el número que viene en el JSON o uno fijo si es para administración
        const numeroDestino = `${celular}@s.whatsapp.net`; 

        await sock.sendMessage(numeroDestino, { text: mensaje });
        console.log(`✅ Mensaje enviado con éxito a ${celular}`);
    } catch (err) {
        console.error("❌ Error enviando mensaje de WhatsApp:", err);
    }
};

module.exports = {
    inicializarWhatsApp,
    enviarPedido
};