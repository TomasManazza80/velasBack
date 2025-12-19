// main.js - VERSIÓN CORREGIDA PARA RENDER
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcodeTerminal = require('qrcode-terminal');

const MY_CHAT_ID = '5493425937358@c.us'; 
const MAX_QR_ATTEMPTS = 3; // Aumentado ligeramente para dar más margen en el deploy
let qrAttempts = 0; 

// Configuración del cliente optimizada para Render
let client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        // Usamos la variable de entorno o la ruta estándar de Linux en Render
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/google-chrome-stable', 
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-zygote',
            '--single-process' // Crucial para ahorrar RAM en Render
        ],
    }
});

const inicializarWhatsApp = (io) => {

    io.on('connection', (socket) => {
        console.log('👤 [Socket] Usuario conectado al panel de control');

        socket.on('whatsapp-restart', async () => {
            console.log('🔄 [WhatsApp] Reinicio solicitado desde el frontend...');
            qrAttempts = 0;
            try {
                await client.destroy();
            } catch (e) {
                console.log('Info: Cliente no estaba activo');
            }
            client.initialize().catch(err => console.error("Error al re-inicializar:", err));
        });
    });

    client.on('qr', async (qr) => {
        qrAttempts++;
        if (qrAttempts > MAX_QR_ATTEMPTS) {
            console.error('⚠️ [WhatsApp] Límite de intentos QR alcanzado.');
            io.emit('whatsapp-status', 'timeout');
            try { await client.destroy(); } catch (err) {}
            return;
        }

        console.log(`📲 [WhatsApp] QR Generado (${qrAttempts}/${MAX_QR_ATTEMPTS})`);
        // Emitimos al frontend para que el componente React lo reciba
        io.emit('whatsapp-qr', qr);
    });

    client.on('ready', () => {
        qrAttempts = 0; 
        console.log('🟢 [WhatsApp] ¡Cliente listo!');
        io.emit('whatsapp-status', 'connected');
    });

    client.on('auth_failure', () => {
        console.error('❌ [WhatsApp] Fallo de autenticación');
        io.emit('whatsapp-status', 'auth_failure');
    });

    client.on('disconnected', () => {
        console.log('❌ [WhatsApp] Desconectado');
        io.emit('whatsapp-status', 'disconnected');
    });

    console.log('🚀 [WhatsApp] Inicializando cliente...');
    client.initialize().catch(err => console.error("Error inicial:", err));
};

const enviarPedido = async (datos) => {
    // ... (Tu lógica de envío de pedido se mantiene igual)
};

module.exports = { enviarPedido, inicializarWhatsApp };