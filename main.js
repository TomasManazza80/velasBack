// main.js - VERSIÓN FINAL ESTABLE
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcodeTerminal = require('qrcode-terminal');

const MY_CHAT_ID = '5493425937358@c.us'; 
const MAX_ATTEMPTS = 2; // Máximo de QRs generados
let qrAttempts = 0;

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ],
    }
});

const inicializarWhatsApp = (io) => {

    const resetearConexion = async () => {
        console.log('🔄 [WhatsApp] Reseteando contador y reiniciando cliente...');
        qrAttempts = 0;
        try {
            await client.destroy();
        } catch (e) {
            console.log("El cliente ya estaba cerrado o no iniciado.");
        }
        client.initialize().catch(err => console.error("Error al re-inicializar:", err));
    };

    // Manejo de conexión de Socket
    // Usamos removeAllListeners para evitar que se acumulen funciones al reconectar
    io.removeAllListeners('connection'); 
    io.on('connection', (socket) => {
        console.log('👤 Cliente conectado al panel de control');
        
        socket.on('whatsapp-restart', () => {
            resetearConexion();
        });
    });

    client.on('qr', async (qr) => {
        qrAttempts++;
        
        if (qrAttempts <= MAX_ATTEMPTS) {
            console.log(`📤 [Socket] Enviando QR ${qrAttempts}/${MAX_ATTEMPTS}`);
            qrcodeTerminal.generate(qr, { small: true });
            io.emit('whatsapp-qr', qr);
        } else {
            console.log('🛑 [WhatsApp] Límite de QRs alcanzado. Deteniendo...');
            io.emit('whatsapp-status', 'timeout');
            try {
                await client.destroy();
            } catch (err) {
                console.error("Error al destruir cliente:", err);
            }
        }
    });

    client.on('ready', () => {
        console.log('🟢 [WhatsApp] ¡Cliente conectado!');
        qrAttempts = 0; 
        io.emit('whatsapp-status', 'connected');
    });

    client.on('disconnected', async (reason) => {
        console.log('❌ [WhatsApp] Desconectado:', reason);
        io.emit('whatsapp-status', 'disconnected');
        // No reiniciamos automáticamente si ya alcanzamos el límite
    });

    console.log('🚀 [WhatsApp] Inicializando cliente...');
    client.initialize().catch(err => console.error("Error inicialización:", err));
};

const enviarPedido = async (datos) => {
    // ... (Tu función de enviarPedido se mantiene igual que antes)
    const { nombre, celular, totalPagado } = datos; // ejemplo simplificado
    try {
        const mensaje = `🛍️ Nuevo pedido de ${nombre}...`; 
        return await client.sendMessage(MY_CHAT_ID, mensaje);
    } catch (error) {
        console.error("Error enviando:", error);
        throw error;
    }
};

module.exports = { enviarPedido, inicializarWhatsApp };