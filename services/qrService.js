const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, delay } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs').promises;
const path = require('path');

let sock = null;
let ultimoQR = null;
let estado = 'loading';
let qrAttempts = 0;
let connectionAttempts = 0;
const MAX_CONNECTION_ATTEMPTS = 3;
const MAX_QR_ATTEMPTS = 10; // Límite de intentos de QR
let isConnected = false;
let reconnectTimeout = null;

// Función para limpiar credenciales
const cleanupAuth = async () => {
    try {
        const authDir = 'auth_info_baileys';
        try {
            const files = await fs.readdir(authDir);
            for (const file of files) {
                await fs.unlink(path.join(authDir, file));
            }
            await fs.rmdir(authDir);
            console.log("🧹 [WhatsApp] Credenciales antiguas eliminadas");
            return true;
        } catch (e) {
            console.log("ℹ️ [WhatsApp] No hay credenciales para limpiar");
            return false;
        }
    } catch (error) {
        console.log("⚠️ Error limpiando auth:", error.message);
        return false;
    }
};

const init = async () => {
    // Limpiar timeout anterior
    if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
    }
    
    // Si ya está conectado, no hacer nada
    if (isConnected && sock) {
        console.log("ℹ️ [WhatsApp] Ya está conectado");
        return;
    }
    
    // Incrementar intentos de conexión
    connectionAttempts++;
    
    if (connectionAttempts > MAX_CONNECTION_ATTEMPTS) {
        console.log("🛑 [WhatsApp] Máximo de intentos de conexión alcanzado");
        estado = 'max_attempts_reached';
        return;
    }
    
    console.log(`🚀 [WhatsApp] Iniciando (Intento conexión ${connectionAttempts}/${MAX_CONNECTION_ATTEMPTS})`);

    try {
        const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
        
        sock = makeWASocket({
            auth: state,
            logger: pino({ level: 'silent' }),
            printQRInTerminal: true, 
            browser: ['Windows', 'Chrome', '120.0.0.0'],
            connectTimeoutMs: 60000,
            keepAliveIntervalMs: 10000,
            markOnlineOnConnect: false, 
        });

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;
            
            // QR disponible
            if (qr) {
                qrAttempts++;
                ultimoQR = qr;
                estado = 'qr';
                console.log(`📲 [WhatsApp] QR generado (Intento ${qrAttempts}/${MAX_QR_ATTEMPTS})`);
                
                // Lógica para detener tras 10 intentos de QR
                if (qrAttempts >= MAX_QR_ATTEMPTS) {
                    console.log("🛑 [WhatsApp] Límite de 10 QRs alcanzado. Deteniendo servicio para ahorrar recursos.");
                    estado = 'max_qr_attempts_reached';
                    
                    if (sock) {
                        sock.ev.removeAllListeners(); 
                        await sock.end();
                        sock = null;
                    }
                    return;
                }

                connectionAttempts = 0;
            }

            // Conexión exitosa
            if (connection === 'open') {
                isConnected = true;
                estado = 'connected';
                ultimoQR = null;
                qrAttempts = 0;
                connectionAttempts = 0;
                console.log("🟢 [WhatsApp] Conectado exitosamente");
            }

            // Conexión cerrada
            if (connection === 'close') {
                isConnected = false;
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                
                console.log(`🔌 [WhatsApp] Desconectado. Código: ${statusCode || 'desconocido'}`);
                
                if (statusCode === 401 || statusCode === DisconnectReason.loggedOut) {
                    console.log("🔑 [WhatsApp] Sesión expirada (401). Limpiando...");
                    estado = 'session_expired';
                    await cleanupAuth();
                    
                    qrAttempts = 0;
                    connectionAttempts = 0;
                    
                    if (sock) {
                        sock.ev.removeAllListeners();
                        await sock.end();
                        sock = null;
                    }
                    
                    console.log("⏳ [WhatsApp] Generando nuevo QR en 3 segundos...");
                    reconnectTimeout = setTimeout(async () => {
                        await init();
                    }, 3000);
                    return;
                }
                
                if (connectionAttempts < MAX_CONNECTION_ATTEMPTS && estado !== 'max_qr_attempts_reached') {
                    estado = 'reconnecting';
                    console.log(`🔄 [WhatsApp] Reconectando en 5 segundos...`);
                    
                    reconnectTimeout = setTimeout(async () => {
                        if (!isConnected) {
                            await init();
                        }
                    }, 5000);
                } else {
                    if (estado !== 'max_qr_attempts_reached') estado = 'disconnected';
                    console.log("🛑 [WhatsApp] No se reconectará automáticamente");
                }
            }
        });
        
        sock.ev.on('error', (err) => {
            console.log("❌ [WhatsApp] Error:", err.message);
        });
        
    } catch (error) {
        console.log("❌ [WhatsApp] Error al inicializar:", error.message);
        estado = 'error';
        isConnected = false;
        
        if (connectionAttempts < MAX_CONNECTION_ATTEMPTS) {
            reconnectTimeout = setTimeout(async () => {
                await init();
            }, 5000);
        }
    }
};

const getStatus = () => ({ 
    qr: ultimoQR, 
    status: estado, 
    qrAttempts: qrAttempts,
    maxQrAttempts: MAX_QR_ATTEMPTS,
    connectionAttempts: connectionAttempts,
    maxAttempts: MAX_CONNECTION_ATTEMPTS,
    isConnected: isConnected,
    timestamp: new Date().toISOString()
});

const restart = async () => {
    console.log("♻️ [WhatsApp] Reinicio manual solicitado");
    
    if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
    }
    
    if (sock) {
        try {
            isConnected = false;
            sock.ev.removeAllListeners();
            await sock.end();
            sock = null;
            console.log("✅ [WhatsApp] Socket cerrado");
        } catch (e) {
            console.log("⚠️ Error cerrando socket:", e.message);
        }
    }
    
    qrAttempts = 0;
    connectionAttempts = 0;
    ultimoQR = null;
    estado = 'loading';
    
    await delay(2000);
    await init();
    
    return { success: true, message: 'Reinicio iniciado' };
};

const disconnect = async () => {
    if (sock) {
        try {
            console.log("🔌 [WhatsApp] Desconexión manual");
            isConnected = false;
            await sock.end();
            sock = null;
            estado = 'manually_disconnected';
            connectionAttempts = MAX_CONNECTION_ATTEMPTS + 1;
        } catch (e) {
            console.log("⚠️ Error desconectando:", e.message);
        }
    }
};

const getSocket = () => sock;

const forceCleanup = async () => {
    return await cleanupAuth();
};

module.exports = { 
    init, 
    getStatus, 
    restart, 
    disconnect,
    getSocket,
    forceCleanup,
    cleanupAuth
};