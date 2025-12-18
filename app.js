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

const { inicializarWhatsApp } = require('./main'); 

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var productRouter = require("./routes/product");
var paymentRouter = require("./routes/paymentRoutes");
var enviarPedidoWhatsappRoutes = require('./routes/enviarPedidoWhatsappRoutes');
const productBought = require("./routes/productBoughtRoute");
var recaudationRouter = require("./routes/recaudationRoutes");

var app = express();
var fronturl = "https://lupetruccelli.com";

// --- MIDDLEWARES ---
app.use(logger("dev"));
// Configuramos CORS de la App igual que el de Sockets
app.use(cors({
    origin: fronturl,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// --- CONFIGURACIÓN DE SERVIDOR HTTP Y SOCKETS ---
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: fronturl,
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'] // Permitimos ambos pero priorizamos websocket
});

inicializarWhatsApp(io);

// --- RUTAS ---
app.use('/', indexRouter);
app.use('/', usersRouter);
app.use('/', productRouter);
app.use('/payment', paymentRouter);
app.use('/boughtProduct', productBought);
app.use('/recaudation', recaudationRouter);
app.use('/enviarPedidoWhatsapp', enviarPedidoWhatsappRoutes);

// Catch 404
app.use(function (req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({ error: err.message }); // En APIs es mejor responder JSON que renderizar PUG
});

// --- LANZAMIENTO (CORREGIDO PARA RENDER) ---
const PORT = 3001; // Render requiere process.env.PORT
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
  console.log(`🔗 Frontend permitido: ${fronturl}`);
});

module.exports = app;