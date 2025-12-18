
// app.js
var dotenv = require('dotenv');
dotenv.config();

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
var http = require("http");
var { Server } = require("socket.io");
var vexor = require("vexor");
const { Vexor } = vexor;

// Importar Lógica de WhatsApp
const { inicializarWhatsApp } = require('./main'); 

// --- IMPORTAR RUTAS ---
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var productRouter = require("./routes/product");
var paymentRouter = require("./routes/paymentRoutes");
var enviarPedidoWhatsappRoutes = require('./routes/enviarPedidoWhatsappRoutes');
const productBought = require("./routes/productBoughtRoute");
var recaudationRouter = require("./routes/recaudationRoutes");

// Configuración de Vexor
const vexorInstance = new Vexor({
  publishableKey: process.env.VEXOR_PUBLISHABLE_KEY,
  projectId: process.env.VEXOR_PROJECT_ID,
  apiKey: process.env.VEXOR_API_KEY,
});


var app = express();
var fronturl = process.env.FRONT_URL ;

// --- CONFIGURACIÓN DE VISTAS (PUG) ---
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// --- MIDDLEWARES ---
app.use(logger("dev"));
app.use(cors());
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

// Inicializamos WhatsApp pasando el objeto 'io'
inicializarWhatsApp(io);

// --- RUTAS DE LA API ---
app.use('/', indexRouter);
app.use('/', usersRouter); // Se movió a su propio path por buena práctica
app.use('/', productRouter);
app.use('/payment', paymentRouter);
app.use('/boughtProduct', productBought);
app.use('/recaudation', recaudationRouter);
app.use('/enviarPedidoWhatsapp', enviarPedidoWhatsappRoutes);

// --- MANEJO DE ERRORES ---

// Catch 404
app.use(function (req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.render("error");
});

// --- LANZAMIENTO DEL SERVIDOR ---
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
  console.log(`🔗 Frontend permitido: ${fronturl}`);
});

module.exports = app;
