// main.js - VERSIÓN COMPLETA PARA PRODUCCIÓN
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcodeTerminal = require('qrcode-terminal');

const MY_CHAT_ID = '5493425937358@c.us'; 
const TEST_MESSAGE = 'Hola, esta es la prueba para LU ecommerce.';

// Configuración del cliente con flags para evitar errores en servidores Linux/Producción
const client = new Client({
    authStrategy: new LocalAuth(), // Mantiene la sesión iniciada
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ],
    }
});

/**
 * Inicializa los eventos de WhatsApp y la conexión con Socket.io
 * @param {Object} io - Instancia de Socket.io pasada desde app.js
 */
const inicializarWhatsApp = (io) => {

    // Evento cuando se necesita escanear QR
    client.on('qr', (qr) => {
        // 1. Mostrar en la terminal del servidor (como respaldo)
        qrcodeTerminal.generate(qr, { small: true });
        
        // 2. Enviar el código al frontend en tiempo real
        console.log('📤 [Socket] Enviando nuevo QR al frontend...');
        io.emit('whatsapp-qr', qr);
    });

    // Evento cuando el cliente está listo
    client.on('ready', () => {
        console.log('🟢 [WhatsApp] ¡Cliente listo y conectado!');
        io.emit('whatsapp-status', 'connected');
        
        // Mensaje opcional de log
        // client.sendMessage(MY_CHAT_ID, TEST_MESSAGE);
    });

    // Evento cuando la sesión se cierra o falla
    client.on('disconnected', async (reason) => {
        console.log('❌ [WhatsApp] Sesión cerrada o desconectada:', reason);
        io.emit('whatsapp-status', 'disconnected');
        
        // IMPORTANTE: Reiniciar el cliente para que genere un nuevo QR automáticamente
        console.log('🔄 [WhatsApp] Reiniciando cliente para generar nuevo código...');
        try {
            await client.destroy();
            client.initialize();
        } catch (error) {
            console.error('Error al intentar reiniciar el cliente:', error);
        }
    });

    // Evento de autenticación fallida
    client.on('auth_failure', msg => {
        console.error('❌ [WhatsApp] Error de autenticación:', msg);
        io.emit('whatsapp-status', 'auth_failure');
    });

    // Inicializar el proceso
    console.log('🚀 [WhatsApp] Inicializando cliente...');
    client.initialize().catch(err => console.error("Error al inicializar:", err));
};

/**
 * Envía el pedido formateado a WhatsApp
 */
const enviarPedido = async (datos) => {
    const {
        nombre = "-",
        celular = "-",
        opcionEnvio = "-",
        calleDireccion = "-",
        ciudad = "-",
        provincia = "-",
        costoEnvio = "0",
        totalPagado = "0",
        productos = [] 
    } = datos;

    // Formatear lista de productos
    let listaProductosTexto = "";
    if (productos && productos.length > 0) {
        productos.forEach((p, index) => {
            listaProductosTexto += `${index + 1}️⃣ *${p.nombre}* x${p.cantidad} - $${p.precio}\n`;
        });
    } else {
        listaProductosTexto = "_No se especificaron productos._\n";
    }

    const mensaje = 
        `🛍️ *NUEVO PEDIDO RECIBIDO*\n\n` +
        `👤 *Cliente:* ${nombre}\n` +
        `📱 *Celular:* ${celular}\n` +
        `🚚 *Método:* ${opcionEnvio}\n` +
        `📍 *Dirección:* ${calleDireccion}\n` +
        `🏙️ *Ciudad:* ${ciudad}, ${provincia}\n\n` +
        `📦 *PRODUCTOS:*\n` +
        `${listaProductosTexto}\n` + 
        `--------------------------\n` +
        `💰 *Costo Envío:* $${costoEnvio}\n` +
        `💵 *TOTAL PAGADO:* $${totalPagado}\n\n` +
        `_Generado por LU ecommerce_`;

    try {
        const response = await client.sendMessage(MY_CHAT_ID, mensaje);
        return response;
    } catch (error) {
        console.error("❌ Error en enviarPedido:", error);
        throw error;
    }
};

// Exportación para ser usado en app.js y en las rutas
module.exports = { 
    enviarPedido, 
    inicializarWhatsApp 
};