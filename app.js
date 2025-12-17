// Carga de variables de entorno
require('dotenv').config();

const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const http = require("http");
const createError = require("http-errors");
const { Server } = require("socket.io");
const vexor = require("vexor");
const { Vexor } = vexor;

// Importar lógica de WhatsApp
const { inicializarWhatsApp } = require('./main');

// Importar Rutas
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const productRouter = require("./routes/product");
const paymentRouter = require("./routes/paymentRoutes");
const productBought = require("./routes/productBoughtRoute");
const recaudationRouter = require("./routes/recaudationRoutes");
const enviarProductosWhatsappRoutes = require('./routes/enviarPedidoWhatsappRoutes');

const app = express();

// --- CONFIGURACIÓN DE VEXOR ---
const vexorInstance = new Vexor({
  publishableKey: process.env.VEXOR_PUBLISHABLE_KEY,
  projectId: process.env.VEXOR_PROJECT_ID,
  apiKey: process.env.VEXOR_API_KEY,
});

// --- CONFIGURACIÓN DE MOTOR DE VISTAS ---
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// --- MIDDLEWARES ---
const fronturl = process.env.FRONT_URL || 'http://localhost:5173';
app.use(cors({
  origin: fronturl,
  methods: ["GET", "POST"]
}));

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// --- CONFIGURACIÓN DE SERVIDOR HTTP Y SOCKETS ---
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: fronturl,
    methods: ["GET", "POST"]
  }
});

// Inicializar WhatsApp pasando la instancia de IO para el QR
inicializarWhatsApp(io);

// --- RUTAS DE LA API ---
app.use(`/`, indexRouter);
app.use(`/`, usersRouter);
app.use(`/`, productRouter);
app.use(`/payment`, paymentRouter);
app.use(`/boughtProduct`, productBought);
app.use(`/recaudation`, recaudationRouter);
app.use('/enviarPedidoWhatsapp', enviarProductosWhatsappRoutes);

// --- MANEJO DE ERRORES (404) ---
app.use(function (req, res, next) {
  next(createError(404));
});

// --- MANEJO DE ERRORES GLOBAL ---
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.render("error");
});

// --- INICIO DEL SERVIDOR ---
// Usamos process.env.PORT para producción, o 3001 por defecto para evitar choques
const PORT =  3001;
server.listen(PORT, () => {
  console.log(`🚀 Servidor unificado corriendo en puerto ${PORT}`);
  console.log(`🔗 Conectado con Frontend en: ${fronturl}`);
});

module.exports = app;