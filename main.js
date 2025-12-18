// main.js - VERSIÓN FINAL CON REINICIO
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcodeTerminal = require('qrcode-terminal');

const MY_CHAT_ID = '5493425937358@c.us'; 

const client = new Client({
    authStrategy: new LocalAuth(),
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

let qrAttempts = 0;
const MAX_ATTEMPTS = 2;

const inicializarWhatsApp = (io) => {

    // Función para resetear el cliente y el contador
    const resetearConexion = async () => {
        console.log('🔄 [WhatsApp] Reiniciando contador y cliente por solicitud del usuario...');
        qrAttempts = 0;
        try {
            await client.destroy();
        } catch (e) {
            console.log("Aviso: El cliente ya estaba detenido.");
        }
        client.initialize().catch(err => console.error("Error al re-inicializar:", err));
    };

    // Escuchar solicitud de reinicio desde el frontend
    io.on('connection', (socket) => {
        socket.on('whatsapp-restart', () => {
            resetearConexion();
        });
    });

    client.on('qr', async (qr) => {
        qrAttempts++;
        
        if (qrAttempts <= MAX_ATTEMPTS) {
            console.log(`📤 [Socket] Enviando QR intento ${qrAttempts}/${MAX_ATTEMPTS}`);
            qrcodeTerminal.generate(qr, { small: true });
            io.emit('whatsapp-qr', qr);
        } else {
            console.log('🛑 [WhatsApp] Límite de QRs alcanzado. Deteniendo cliente.');
            io.emit('whatsapp-status', 'timeout');
            
            try {
                await client.destroy();
            } catch (err) {
                console.error("Error al destruir cliente:", err);
            }
        }
    });

    client.on('ready', () => {
        console.log('🟢 [WhatsApp] ¡Cliente listo y conectado!');
        qrAttempts = 0; 
        io.emit('whatsapp-status', 'connected');
    });

    client.on('disconnected', async (reason) => {
        console.log('❌ [WhatsApp] Sesión cerrada:', reason);
        io.emit('whatsapp-status', 'disconnected');
        
        if (qrAttempts < MAX_ATTEMPTS) {
            try {
                await client.destroy();
                client.initialize();
            } catch (error) {
                console.error('Error al reiniciar:', error);
            }
        }
    });

    client.on('auth_failure', msg => {
        console.error('❌ [WhatsApp] Error de autenticación:', msg);
        io.emit('whatsapp-status', 'auth_failure');
    });

    console.log('🚀 [WhatsApp] Inicializando cliente...');
    client.initialize().catch(err => console.error("Error al inicializar:", err));
};

const enviarPedido = async (datos) => {
    const {
        nombre = "-", celular = "-", opcionEnvio = "-",
        calleDireccion = "-", ciudad = "-", provincia = "-",
        costoEnvio = "0", totalPagado = "0", productos = [] 
    } = datos;

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

module.exports = { enviarPedido, inicializarWhatsApp };