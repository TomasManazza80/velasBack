// app.js
var dotenv = require('dotenv');
dotenv.config();

var express = require("express");
var path = require("path");
var cors = require("cors");
var http = require("http");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var createError = require("http-errors");
var { Server } = require("socket.io");
var vexor = require("vexor");
const { Vexor } = vexor;

// Importación de lógica externa
const { inicializarWhatsApp } = require('./main'); 

// Rutas
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var productRouter = require("./routes/product");
var paymentRouter = require("./routes/paymentRoutes");
var productBought = require("./routes/productBoughtRoute");
var recaudationRouter = require("./routes/recaudationRoutes");
var enviarPedidoWhatsappRoutes = require('./routes/enviarPedidoWhatsappRoutes');

var fronturl = process.env.FRONT_URL || 'http://localhost:5173';
var app = express();

// Configuración de Vexor
const vexorInstance = new Vexor({
  publishableKey: process.env.VEXOR_PUBLISHABLE_KEY,
  projectId: process.env.VEXOR_PROJECT_ID,
  apiKey: process.env.VEXOR_API_KEY,
});

// Configuración de motor de plantillas (Pug)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Middleware
app.use(logger("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Configuración de Servidor HTTP y Sockets
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: fronturl,
    methods: ["GET", "POST"]
  }
});

// Iniciamos WhatsApp pasando el objeto 'io'
inicializarWhatsApp(io);

// Registro de Rutas de la API
app.use(`/`, indexRouter);
app.use(`/`, usersRouter);
app.use(`/`, productRouter);
app.use(`/payment`, paymentRouter);
app.use(`/boughtProduct`, productBought);
app.use(`/recaudation`, recaudationRouter);
app.use('/enviarPedidoWhatsapp', enviarPedidoWhatsappRoutes);

// Manejo de error 404
app.use(function (req, res, next) {
  next(createError(404));
});

// Manejador de errores global
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.render("error");
});


const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor en puerto ${PORT}`);
});

module.exports = app;