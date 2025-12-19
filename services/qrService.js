const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcodeTerminal = require('qrcode-terminal');

let ultimoQR = null;
let estado = 'loading'; 
let qrAttempts = 0; // NUEVO: Contador de intentos
let client = null; // Definido fuera para poder re-instanciarlo

const isLinux = process.platform === 'linux';

// Configuración de Puppeteer
const puppeteerOptions = {
    headless: true,
    executablePath: isLinux ? '/usr/bin/google-chrome-stable' : undefined,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
};

const init = () => {
    console.log("🚀 [WhatsApp] Iniciando navegador...");
    qrAttempts = 0; // Resetear contador al iniciar

    client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: puppeteerOptions
    });

    client.on('qr', async (qr) => {
        qrAttempts++;

        // --- LÓGICA DE CORTE ---
        if (qrAttempts > 2) {
            console.error(`⚠️ [WhatsApp] Límite de 2 QRs alcanzado. Deteniendo para evitar spam.`);
            estado = 'timeout'; // Estado para que el frontend sepa que debe parar
            ultimoQR = null;
            try {
                await client.destroy(); // Cerramos el navegador Puppeteer
            } catch (e) {
                console.error("Error al detener el cliente:", e);
            }
            return; // Salimos de la función
        }

        ultimoQR = qr;
        estado = 'qr';
        console.log(`📲 [WhatsApp] Nuevo QR generado (Intento ${qrAttempts}/2)`);
        qrcodeTerminal.generate(qr, { small: true });
    });

    client.on('ready', () => {
        ultimoQR = null;
        estado = 'connected';
        qrAttempts = 0; // Resetear al conectar con éxito
        console.log('🟢 [WhatsApp] Cliente conectado y listo');
    });

    client.on('auth_failure', () => {
        estado = 'disconnected';
        console.error("❌ [WhatsApp] Error de autenticación");
    });

    client.on('disconnected', async (reason) => {
        estado = 'disconnected';
        console.log('ℹ️ [WhatsApp] Cliente desconectado:', reason);
    });

    client.initialize().catch(err => {
        console.error("❌ Error Init:", err);
        estado = 'disconnected';
    });
};

const getStatus = () => ({ 
    qr: ultimoQR, 
    status: estado, 
    attempts: qrAttempts 
});

const restart = async () => {
    console.log("♻️ [WhatsApp] Reiniciando servicio...");
    ultimoQR = null;
    estado = 'loading';
    qrAttempts = 0; // REINICIO FUNDAMENTAL
    
    try {
        if (client) {
            await client.destroy();
            client = null; // Limpiamos la instancia
        }
    } catch (e) {
        console.log("Error al limpiar cliente previo");
    }
    
    // IMPORTANTE: No usamos 'return', ejecutamos init y dejamos que corra
    init();
};

module.exports = { init, getStatus, restart };