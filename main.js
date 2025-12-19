// main.js - VERSIÓN COMPLETA CON FUNCIÓN DE REINICIO
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcodeTerminal = require('qrcode-terminal');

const MY_CHAT_ID = '5493425937358@c.us'; 
const MAX_QR_ATTEMPTS = 2; 
let qrAttempts = 0; 

// Configuramos el cliente fuera de la función para tener la referencia
let client = new Client({
    authStrategy: new LocalAuth(),
 puppeteer: {
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/google-chrome-stable', 
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu', // Recomendado para Render
    ],
}
});

/**
 * Inicializa los eventos de WhatsApp y escucha comandos del Frontend
 */
const inicializarWhatsApp = (io) => {

    // --- MANEJO DE EVENTOS DEL SOCKET (Desde el Frontend) ---
    io.on('connection', (socket) => {
        console.log('👤 [Socket] Usuario conectado al panel de control');

        // Esta es la función que pediste: Reinicia el contador y el proceso
        socket.on('whatsapp-restart', async () => {
            console.log('🔄 [WhatsApp] Reinicio solicitado desde el frontend...');
            qrAttempts = 0; // Reiniciamos el contador global
            
            try {
                // Intentamos destruir el cliente actual si existe
                await client.destroy();
            } catch (e) {
                console.log('Info: Cliente no estaba activo al intentar destruir');
            }

            // Re-inicializamos el cliente
            client.initialize().catch(err => console.error("Error al re-inicializar:", err));
        });
    });

    // --- MANEJO DE EVENTOS DEL CLIENTE WHATSAPP ---

    client.on('qr', async (qr) => {
        qrAttempts++;
        
        if (qrAttempts > MAX_QR_ATTEMPTS) {
            console.error('⚠️ [WhatsApp] Límite de intentos QR alcanzado.');
            io.emit('whatsapp-status', 'timeout'); // Coincide con tu lógica de React
            
            try {
                await client.destroy();
            } catch (err) {
                console.error('Error al destruir:', err);
            }
            return;
        }

        console.log(`📲 [WhatsApp] QR Generado (${qrAttempts}/${MAX_QR_ATTEMPTS})`);
        qrcodeTerminal.generate(qr, { small: true });
        io.emit('whatsapp-qr', qr);
    });

    client.on('ready', () => {
        qrAttempts = 0; 
        console.log('🟢 [WhatsApp] ¡Cliente listo!');
        io.emit('whatsapp-status', 'connected');
    });

    client.on('auth_failure', msg => {
        console.error('❌ [WhatsApp] Fallo de auth');
        io.emit('whatsapp-status', 'auth_failure');
    });

    client.on('disconnected', async (reason) => {
        console.log('❌ [WhatsApp] Desconectado');
        io.emit('whatsapp-status', 'disconnected');
    });

    // Primera inicialización
    console.log('🚀 [WhatsApp] Inicializando cliente por primera vez...');
    client.initialize().catch(err => console.error("Error inicial:", err));
};

/**
 * Envía el pedido formateado
 */
const enviarPedido = async (datos) => {
    const {
        nombre = "-", celular = "-", opcionEnvio = "-", 
        calleDireccion = "-", ciudad = "-", provincia = "-", 
        costoEnvio = "0", totalPagado = "0", productos = [] 
    } = datos;

    let listaProductosTexto = productos.length > 0 
        ? productos.map((p, i) => `${i + 1}️⃣ *${p.nombre}* x${p.cantidad} - $${p.precio}`).join('\n')
        : "_No se especificaron productos._";

    const mensaje = 
        `🛍️ *NUEVO PEDIDO RECIBIDO*\n\n` +
        `👤 *Cliente:* ${nombre}\n` +
        `📱 *Celular:* ${celular}\n` +
        `🚚 *Método:* ${opcionEnvio}\n` +
        `📍 *Dirección:* ${calleDireccion}\n` +
        `🏙️ *Ciudad:* ${ciudad}, ${provincia}\n\n` +
        `📦 *PRODUCTOS:*\n` +
        `${listaProductosTexto}\n\n` + 
        `💰 *Costo Envío:* $${costoEnvio}\n` +
        `💵 *TOTAL PAGADO:* $${totalPagado}\n\n` +
        `_Generado por LU ecommerce_`;

    try {
        return await client.sendMessage(MY_CHAT_ID, mensaje);
    } catch (error) {
        console.error("❌ Error en enviarPedido:", error);
        throw error;
    }
};

module.exports = { 
    enviarPedido, 
    inicializarWhatsApp 
};