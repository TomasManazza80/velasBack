const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');

let sock = null;
let ultimoQR = null;
let estado = 'loading';
let qrAttempts = 0;
let connectionAttempts = 0;
const MAX_CONNECTION_ATTEMPTS = 3;
let isConnected = false; // Nueva bandera para controlar estado de conexión

const init = async () => {
    // Verificar si ya estamos conectados
    if (isConnected) {
        console.log("ℹ️ [WhatsApp] Ya está conectado, no se requiere nueva conexión.");
        return;
    }
    
    // Incrementar el contador de intentos
    connectionAttempts++;
    
    if (connectionAttempts > MAX_CONNECTION_ATTEMPTS) {
        console.log("🛑 [WhatsApp] Límite máximo de 3 intentos alcanzado. Deteniendo...");
        estado = 'max_attempts_reached';
        return;
    }
    
    console.log(`🚀 [WhatsApp] Iniciando instancia segura... (Intento ${connectionAttempts}/${MAX_CONNECTION_ATTEMPTS})`);

    try {
        const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
        
        sock = makeWASocket({
            auth: state,
            logger: pino({ level: 'silent' }),
        });

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect, qr } = update;
            
            // Manejo de QR
            if (qr) {
                qrAttempts++;
                if (qrAttempts > 5) {
                    console.log("⚠️ [WhatsApp] Límite de QR alcanzado.");
                    estado = 'qr_timeout';
                    ultimoQR = null;
                    
                    if (sock) {
                        sock.ev.removeAllListeners('connection.update');
                        sock.end();
                        sock = null;
                    }
                    return;
                }
                ultimoQR = qr;
                estado = 'qr';
                console.log(`📲 [WhatsApp] Código QR listo (QR Intento ${qrAttempts}/2)`);
            }

            // Conexión exitosa
            if (connection === 'open') {
                isConnected = true;
                estado = 'connected';
                ultimoQR = null;
                qrAttempts = 0;
                console.log("🟢 [WhatsApp] Conexión establecida con éxito.");
                
                // NO resetear connectionAttempts aquí - solo cuando se desconecta completamente
            }

            // Conexión cerrada
            if (connection === 'close') {
                isConnected = false; // Actualizar bandera
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                
                console.log(`🔌 [WhatsApp] Desconectado. Código: ${statusCode || 'desconocido'}`);
                
                // Solo reconectar si NO fue un logout manual
                if (statusCode !== DisconnectReason.loggedOut && 
                    estado !== 'qr_timeout' &&
                    connectionAttempts <= MAX_CONNECTION_ATTEMPTS) {
                    
                    estado = 'disconnected';
                    
                    // Esperar antes de reconectar
                    console.log(`ℹ️ [WhatsApp] Reconectando en 3 segundos... (Intento ${connectionAttempts}/${MAX_CONNECTION_ATTEMPTS})`);
                    
                    setTimeout(() => {
                        if (!isConnected) { // Solo reconectar si no está conectado
                            init();
                        }
                    }, 3000);
                } else {
                    estado = 'permanently_disconnected';
                    console.log("🛑 [WhatsApp] Conexión cerrada permanentemente.");
                    
                    if (connectionAttempts > MAX_CONNECTION_ATTEMPTS) {
                        console.log("🔴 [WhatsApp] Máximo de intentos alcanzado. No se reintentará más.");
                    }
                }
            }
        });
        
        // Manejar errores inesperados
        sock.ev.on('connection.update', (update) => {
            if (update.qr === undefined && update.connection === undefined) {
                console.log("⚠️ [WhatsApp] Evento de conexión sin estado claro.");
            }
        });
        
    } catch (error) {
        console.log("❌ [WhatsApp] Error al inicializar:", error.message);
        estado = 'error';
        isConnected = false;
    }
};

const getStatus = () => ({ 
    qr: ultimoQR, 
    status: estado, 
    qrAttempts: qrAttempts,
    connectionAttempts: connectionAttempts,
    maxAttempts: MAX_CONNECTION_ATTEMPTS,
    isConnected: isConnected
});

const restart = async () => {
    console.log("♻️ [WhatsApp] Reiniciando servicio manualmente...");
    
    // Cerrar conexión actual si existe
    if (sock) {
        try {
            isConnected = false;
            sock.ev.removeAllListeners('connection.update');
            sock.ev.removeAllListeners('creds.update');
            await sock.end();
            sock = null;
        } catch (e) {
            console.log("⚠️ Error al cerrar socket anterior:", e.message);
        }
    }
    
    // Resetear contadores
    qrAttempts = 0;
    connectionAttempts = 0;
    ultimoQR = null;
    estado = 'loading';
    
    // Pequeña pausa antes de reiniciar
    setTimeout(async () => {
        await init();
    }, 1000);
};

// Función para desconectar manualmente
const disconnect = async () => {
    if (sock) {
        try {
            console.log("🔌 [WhatsApp] Desconectando manualmente...");
            isConnected = false;
            await sock.end();
            sock = null;
            estado = 'manually_disconnected';
            connectionAttempts = MAX_CONNECTION_ATTEMPTS + 1; // Evitar reconexión automática
        } catch (e) {
            console.log("⚠️ Error al desconectar:", e.message);
        }
    }
};

const getSocket = () => sock;

module.exports = { 
    init, 
    getStatus, 
    restart, 
    disconnect,
    getSocket
};