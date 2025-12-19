var dotenv = require('dotenv');
dotenv.config();

var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
var createError = require("http-errors");

// --- IMPORTACIÓN DE RUTAS ---
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var productRouter = require("./routes/product");
var paymentRouter = require("./routes/paymentRoutes");
var productBought = require("./routes/productBoughtRoute");
var recaudationRouter = require("./routes/recaudationRoutes");
var enviarProductosWhatsappRoutes = require('./routes/enviarPedidoWhatsappRoutes');
var qrRoutes = require('./routes/qrRoutes');

// --- IMPORTACIÓN DEL SERVICIO DE WHATSAPP ---
// Importamos el servicio para poder inicializarlo
const qrService = require('./services/qrService'); 

var app = express();

// --- INICIALIZACIÓN DE WHATSAPP ---
// Esta línea es la que dispara el navegador Puppeteer y genera el QR
qrService.init(); 

// --- CONFIGURACIÓN DE VEXOR (Opcional si usas el SDK) ---
const vexor = require("vexor");
const { Vexor } = vexor;
const vexorInstance = new Vexor({
  publishableKey: process.env.VEXOR_PUBLISHABLE_KEY,
  projectId: process.env.VEXOR_PROJECT_ID,
  apiKey: process.env.VEXOR_API_KEY,
});

// Configuración de vistas
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// --- MIDDLEWARES ---
app.use(cors()); // Permitir peticiones desde el frontend (React)
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// --- RUTAS DE LA API ---
app.use(`/`, indexRouter);
app.use(`/`, usersRouter);
app.use(`/`, productRouter);
app.use(`/payment`, paymentRouter);
app.use(`/boughtProduct`, productBought);
app.use(`/recaudation`, recaudationRouter);
app.use('/enviarPedidoWhatsapp', enviarProductosWhatsappRoutes);

// Esta ruta manejará /qr/status y /qr/restart
app.use('/qr', qrRoutes); 

// --- MANEJO DE ERRORES ---
app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;