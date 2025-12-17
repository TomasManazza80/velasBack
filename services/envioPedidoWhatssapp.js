// services/envioPedidoWhatssapp.js

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const MY_CHAT_ID = '5493425937358@c.us'; 

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { 
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    }
});

let isReady = false; // Variable para rastrear el estado

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('--- 🛑 ESCANEE EL QR PARA VINCULAR 🛑 ---');
});

client.on('ready', () => {
    isReady = true; // El cliente ya puede enviar mensajes
    console.log('🟢 WhatsApp Service: ¡Listo para enviar pedidos!');
});

client.initialize();

const enviarPedido = async (datos) => {
    // 1. Validar si el bot está listo
    if (!isReady) {
        throw new Error('El servicio de WhatsApp aún se está iniciando o no está vinculado. Espere unos segundos.');
    }

    const {
        nombre = "-", celular = "-", opcionEnvio = "-",
        calleDireccion = "-", ciudad = "-", provincia = "-",
        costoEnvio = "0", totalPagado = "0"
    } = datos;

    const mensaje = 
        `🛍️ *NUEVO PEDIDO RECIBIDO*\n\n` +
        `👤 *Cliente:* ${nombre}\n` +
        `📱 *Celular:* ${celular}\n` +
        `🚚 *Método:* ${opcionEnvio}\n` +
        `📍 *Dirección:* ${calleDireccion}\n` +
        `🏙️ *Ciudad:* ${ciudad}, ${provincia}\n` +
        `--------------------------\n` +
        `💰 *Costo Envío:* $${costoEnvio}\n` +
        `💵 *TOTAL PAGADO:* $${totalPagado}`;

    // 2. Intentar el envío
    return await client.sendMessage(MY_CHAT_ID, mensaje);
};

module.exports = { client, enviarPedido };