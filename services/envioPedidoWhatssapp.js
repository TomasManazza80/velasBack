// services/envioPedidoWhatsapp.js - Versión con Baileys
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const path = require('path');

const MY_CHAT_ID = '5493425937358@s.whatsapp.net'; // NOTA: @s.whatsapp.net en lugar de @c.us

let sock = null;
let isReady = false;
let qrCode = null;

// Directorio para guardar las credenciales
const authFolder = './baileys_auth_info';

// Función para inicializar la conexión
const initWhatsApp = async () => {
    try {
        console.log('🔄 Inicializando conexión WhatsApp con Baileys...');
        
        const { state, saveCreds } = await useMultiFileAuthState(authFolder);
        const { version } = await fetchLatestBaileysVersion();
        
        sock = makeWASocket({
            version,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, {}),
            },
            printQRInTerminal: true,
            defaultQueryTimeoutMs: 60_000,
        });

        // Manejar eventos
        sock.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect, qr } = update;
            
            if (qr) {
                qrCode = qr;
                console.log('📱 Escanea el QR code con tu WhatsApp');
            }
            
            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect?.error )?.output?.statusCode !== DisconnectReason.loggedOut;
                console.log(`🔌 Conexión cerrada. Reconectar: ${shouldReconnect}`);
                
                if (shouldReconnect) {
                    setTimeout(() => initWhatsApp(), 5000);
                }
            } else if (connection === 'open') {
                isReady = true;
                console.log('🟢 WhatsApp conectado y listo para enviar mensajes');
                qrCode = null;
            }
        });

        sock.ev.on('creds.update', saveCreds);
        
        return sock;
        
    } catch (error) {
        console.error('❌ Error al inicializar WhatsApp:', error);
        throw error;
    }
};

// Inicializar al cargar el módulo
initWhatsApp().catch(console.error);

const enviarPedido = async (datos) => {
    // 1. Validar si el bot está listo
    if (!isReady || !sock) {
        throw new Error('El servicio de WhatsApp aún se está iniciando o no está vinculado. Espere unos segundos.');
    }

    // 2. Validar datos mínimos
    if (!datos || Object.keys(datos).length === 0) {
        throw new Error('No se recibieron datos del pedido');
    }

    // 3. Desestructurar datos con valores por defecto
    const {
        nombre = "Cliente",
        celular = "No proporcionado",
        opcionEnvio = "Retiro en local",
        calleDireccion = "",
        ciudad = "",
        provincia = "",
        costoEnvio = "0",
        totalPagado = "0",
        productos = []
    } = datos;

    // 4. Formatear lista de productos
    let listaProductos = "";
    let subtotal = 0;
    
    if (productos && productos.length > 0) {
        listaProductos = "\n📦 *PRODUCTOS:*\n";
        productos.forEach((producto, index) => {
            const cantidad = producto.cantidad || 1;
            const nombreProducto = producto.nombre || `Producto ${index + 1}`;
            const precio = producto.precio || "0";
            const precioNum = parseFloat(precio) || 0;
            
            listaProductos += `  • ${cantidad}x ${nombreProducto} - $${precio}\n`;
            subtotal += precioNum * cantidad;
        });
        
        // Agregar subtotal si hay productos
        listaProductos += `\n📊 *Subtotal productos:* $${subtotal}`;
    } else {
        listaProductos = "\n📦 *PRODUCTOS:* No especificados\n";
    }

    // 5. Calcular total si no viene
    const total = totalPagado !== "0" ? parseFloat(totalPagado) : (subtotal + parseFloat(costoEnvio || 0));
    
    // 6. Formatear información de envío
    let infoEnvio = "";
    if (opcionEnvio === "Envío a domicilio") {
        infoEnvio = `📍 *DIRECCIÓN DE ENVÍO:*\n`;
        infoEnvio += `   Calle: ${calleDireccion || "No especificada"}\n`;
        if (ciudad) infoEnvio += `   Ciudad: ${ciudad}\n`;
        if (provincia) infoEnvio += `   Provincia: ${provincia}\n`;
        infoEnvio += `\n🚚 *Método:* ${opcionEnvio}\n`;
    } else {
        infoEnvio = `🚚 *Método:* ${opcionEnvio}\n`;
    }

    // 7. Construir mensaje completo
    const mensaje = 
        `🛍️ *NUEVO PEDIDO RECIBIDO*\n` +
        `⏰ ${new Date().toLocaleString('es-AR', { 
            timeZone: 'America/Argentina/Buenos_Aires',
            dateStyle: 'short',
            timeStyle: 'short' 
        })}\n\n` +
        `👤 *CLIENTE:* ${nombre}\n` +
        `📱 *TELÉFONO:* ${celular}\n` +
        `\n${infoEnvio}` +
        `\n${listaProductos}\n` +
        `\n💰 *Costo de envío:* $${costoEnvio}\n` +
        `💵 *TOTAL A PAGAR:* $${total}\n` +
        `\n────────────────────\n` +
        `🛒 *Origen:* Web\n` +
        `📋 *ID Pedido:* ${Date.now().toString().slice(-6)}\n` +
        `\n_📲 Pedido recibido automáticamente_`;

    try {
        console.log('📤 Enviando pedido a WhatsApp usando Baileys...');
        console.log('📄 Datos del pedido:', {
            cliente: nombre,
            celular: celular,
            productos: productos.length,
            total: total
        });

        // 8. Enviar mensaje al administrador usando Baileys
        // Asegurar que el número tenga el formato correcto
        let numeroDestino = MY_CHAT_ID;
        if (!numeroDestino.includes('@s.whatsapp.net') && !numeroDestino.includes('@c.us')) {
            numeroDestino = MY_CHAT_ID + '@s.whatsapp.net';
        }

        const resultado = await sock.sendMessage(numeroDestino, { 
            text: mensaje 
        });
        
        console.log('✅ Pedido enviado exitosamente con Baileys');
        console.log('📱 ID del mensaje:', resultado?.key?.id);
        
        return {
            success: true,
            messageId: resultado?.key?.id,
            timestamp: new Date(),
            data: {
                cliente: nombre,
                celular: celular,
                total: total,
                productosCount: productos.length,
                method: 'Baileys'
            }
        };
        
    } catch (error) {
        console.error('❌ Error al enviar mensaje con Baileys:', error);
        throw new Error(`Error al enviar pedido: ${error.message}`);
    }
};

// Función para obtener el estado del servicio
const getServiceStatus = () => {
    return {
        isReady,
        qrCode,
        status: isReady ? '🟢 Conectado' : (qrCode ? '📱 Esperando QR' : '🔴 Desconectado'),
        lastCheck: new Date(),
        method: 'Baileys'
    };
};

// Función para obtener el QR (para mostrar en el panel)
const getQRCode = () => {
    return qrCode;
};

module.exports = { 
    enviarPedido,
    getServiceStatus,
    getQRCode,
    initWhatsApp
};