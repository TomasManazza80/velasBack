// app.js
var dotenv = require('dotenv');
dotenv.config();

var express = require("express");
var path = require("path");
var cors = require("cors");
var http = require("http");
var { Server } = require("socket.io");
const { inicializarWhatsApp } = require('./main'); // Importamos la nueva función

// Rutas
var indexRouter = require("./routes/index");
var productRouter = require("./routes/product");
var paymentRouter = require("./routes/paymentRoutes");
var enviarPedidoWhatsappRoutes = require('./routes/enviarPedidoWhatsappRoutes');
var fronturl = process.env.FRONT_URL || 'http://localhost:5173';
var app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Configuración de Servidor HTTP y Sockets
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: fronturl, // URL de tu React (ajustar si es necesario)
    methods: ["GET", "POST"]
  }
});

// Iniciamos WhatsApp pasando el objeto 'io'
inicializarWhatsApp(io);

// Rutas de la API
app.use(`/`, indexRouter);
app.use(`/`, productRouter);
app.use(`/payment`, paymentRouter);
app.use('/enviarPedidoWhatsapp', enviarPedidoWhatsappRoutes);

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en ${PORT}`);
});

module.exports = app;