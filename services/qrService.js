const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');

let sock = null;
let ultimoQR = null;
let estado = 'loading';
let qrAttempts = 0;

const init = async () => {
    // 1. Limpiamos logs obsoletos quitando printQRInTerminal
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    
    console.log("🚀 [WhatsApp] Iniciando instancia segura...");

    sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }), // Silencia logs internos de la librería
        // printQRInTerminal: true, <--- ELIMINADO para evitar el spam de deprecación
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        // 2. Manejo de QR con control de intentos
        if (qr) {
            qrAttempts++;
            if (qrAttempts > 2) {
                console.log("⚠️ [WhatsApp] Límite de intentos alcanzado. Deteniendo para ahorrar recursos.");
                estado = 'timeout';
                ultimoQR = null;
                
                // Cierre real del socket para evitar bucles infinitos
                if (sock) {
                    sock.ev.removeAllListeners('connection.update'); // Evita reintentos automáticos
                    sock.end();
                    sock = null;
                }
                return;
            }
            ultimoQR = qr;
            estado = 'qr';
            console.log(`📲 [WhatsApp] Código QR listo (Intento ${qrAttempts}/2)`);
        }

        // 3. Manejo de estados de conexión
        if (connection === 'open') {
            estado = 'connected';
            ultimoQR = null;
            qrAttempts = 0;
            console.log("🟢 [WhatsApp] Conexión establecida con éxito.");
        }

        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut && estado !== 'timeout';
            
            estado = 'disconnected';

            // Solo reconecta si no fue un logout manual y si no estamos en timeout
            if (shouldReconnect) {
                console.log("ℹ️ [WhatsApp] Reconexión automática en curso...");
                init();
            } else {
                console.log("🛑 [WhatsApp] Conexión cerrada permanentemente.");
            }
        }
    });
};

const getStatus = () => ({ 
    qr: ultimoQR, 
    status: estado, 
    attempts: qrAttempts 
});

const restart = async () => {
    console.log("♻️ [WhatsApp] Reiniciando servicio manualmente...");
    qrAttempts = 0;
    ultimoQR = null;
    estado = 'loading';
    
    if (sock) {
        try {
            sock.ev.removeAllListeners('connection.update');
            sock.end();
        } catch (e) {}
    }
    
    await init();
};

const getSocket = () => sock;

module.exports = { init, getStatus, restart, getSocket };