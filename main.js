const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcodeTerminal = require('qrcode-terminal');

const MY_CHAT_ID = '5493425937358@c.us'; 
const MAX_ATTEMPTS = 2; 
let qrAttempts = 0;

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        executablePath: '/usr/bin/google-chrome-stable', // RUTA CRÍTICA PARA RENDER
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
            console.log("Aviso: El cliente ya estaba cerrado.");
        }
        // Pequeño delay antes de inicializar para asegurar que el proceso anterior murió
        setTimeout(() => {
            client.initialize().catch(err => console.error("Error al re-inicializar:", err));
        }, 2000);
    };

    // Gestión Global de Sockets para evitar duplicados
    io.on('connection', (socket) => {
        console.log('👤 Cliente conectado al panel');
        
        socket.on('whatsapp-restart', () => {
            resetearConexion();
        });

        // Al conectar, enviamos el estado actual para que el front no se quede en "loading"
        if (qrAttempts >= MAX_ATTEMPTS) {
            socket.emit('whatsapp-status', 'timeout');
        }
    });

    client.on('qr', (qr) => {
        qrAttempts++;
        if (qrAttempts <= MAX_ATTEMPTS) {
            console.log(`📤 Enviando QR ${qrAttempts}/${MAX_ATTEMPTS}`);
            qrcodeTerminal.generate(qr, { small: true });
            io.emit('whatsapp-qr', qr);
        } else {
            console.log('🛑 Límite alcanzado.');
            io.emit('whatsapp-status', 'timeout');
            client.destroy().catch(err => console.error("Error al destruir:", err));
        }
    });

    client.on('ready', () => {
        console.log('🟢 Cliente conectado!');
        qrAttempts = 0; 
        io.emit('whatsapp-status', 'connected');
    });

    client.on('disconnected', (reason) => {
        console.log('❌ Sesión cerrada:', reason);
        io.emit('whatsapp-status', 'disconnected');
    });

    client.initialize().catch(err => console.error("Error inicialización:", err));
};

module.exports = { inicializarWhatsApp };