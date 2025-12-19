const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcodeTerminal = require('qrcode-terminal');

// Configuración de destino
const MY_CHAT_ID = '5493425937358@c.us'; 
const MAX_QR_ATTEMPTS = 3; 
let qrAttempts = 0; 
let ultimoQR = null; // Almacena el QR para entregarlo de inmediato a nuevos clientes web

// Detectar si el entorno es Linux (Render) para la ruta de Google Chrome
const isLinux = process.platform === 'linux';

let client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        // En Windows usa el navegador por defecto de puppeteer, en Linux usa el de Render
        executablePath: isLinux ? '/usr/bin/google-chrome-stable' : undefined, 
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-zygote',
            ...(isLinux ? ['--single-process'] : [])
        ],
    }
});

/**
 * Inicializa la comunicación entre WhatsApp y el Frontend vía Sockets
 */
const inicializarWhatsApp = (io) => {

    io.on('connection', (socket) => {
        console.log('👤 [Socket] Cliente conectado al panel de control');

        // Si ya hay un QR generado y guardado, se envía apenas el cliente abre la web
        if (ultimoQR) {
            console.log('📤 Enviando QR almacenado al cliente conectado');
            socket.emit('whatsapp-qr', ultimoQR);
            socket.emit('whatsapp-status', 'qr');
        }

        // Escucha la petición de reinicio desde el botón del frontend
        socket.on('whatsapp-restart', async () => {
            console.log('🔄 [WhatsApp] Solicitud de reinicio recibida...');
            qrAttempts = 0;
            ultimoQR = null;
            try {
                await client.destroy();
            } catch (e) {
                // El cliente ya estaba cerrado o no existía
            }
            client.initialize().catch(err => console.error("❌ Error al re-inicializar:", err));
        });
    });

    // --- EVENTOS DEL CLIENTE DE WHATSAPP ---

    client.on('qr', (qr) => {
        ultimoQR = qr; // Guardar en memoria
        qrAttempts++;
        
        if (qrAttempts > MAX_QR_ATTEMPTS) {
            console.error('⚠️ [WhatsApp] Máximo de intentos QR alcanzado.');
            io.emit('whatsapp-status', 'timeout');
            return;
        }

        console.log(`📲 [WhatsApp] QR Generado (${qrAttempts}/${MAX_QR_ATTEMPTS})`);
        
        // Mostrar en la consola del servidor (Local)
        qrcodeTerminal.generate(qr, { small: true });
        
        // Enviar al componente de React (Frontend)
        io.emit('whatsapp-qr', qr);
    });

    client.on('ready', () => {
        qrAttempts = 0; 
        ultimoQR = null; // Limpiar memoria al conectar con éxito
        console.log('🟢 [WhatsApp] ¡Cliente listo y conectado!');
        io.emit('whatsapp-status', 'connected');
    });

    client.on('auth_failure', () => {
        console.error('❌ [WhatsApp] Error de autenticación');
        io.emit('whatsapp-status', 'auth_failure');
    });

    client.on('disconnected', () => {
        console.log('❌ [WhatsApp] Cliente desconectado');
        ultimoQR = null;
        io.emit('whatsapp-status', 'disconnected');
    });

    // Arrancar el proceso
    console.log('🚀 [WhatsApp] Inicializando motores...');
    client.initialize().catch(err => {
        console.error("❌ Error fatal de Puppeteer:", err.message);
    });
};

/**
 * Función para enviar pedidos formateados a través de WhatsApp
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
        console.error("❌ Error al enviar mensaje de WhatsApp:", error);
        throw error;
    }
};

module.exports = { enviarPedido, inicializarWhatsApp };