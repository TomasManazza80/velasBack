var dotenv = require('dotenv');
dotenv.config();


var enviarProductosWhatsappRoutes = require('./routes/enviarPedidoWhatsappRoutes');
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var productRouter = require("./routes/product");
var paymentRouter = require("./routes/paymentRoutes");  // Agregar esta línea
var vexor = require("vexor");
const productBought = require("./routes/productBoughtRoute");
var recaudationRouter = require("./routes/recaudationRoutes");
const { Vexor } = vexor;






var app = express();
const PORT = 3000;
const vexorInstance = new Vexor({
  publishableKey: process.env.VEXOR_PUBLISHABLE_KEY,
  projectId: process.env.VEXOR_PROJECT_ID,
  apiKey: process.env.VEXOR_API_KEY,
});


app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));





app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

app.use(`/`, indexRouter);
app.use(`/`, usersRouter);
app.use(`/`, productRouter);
app.use(`/payment`, paymentRouter);
app.use(`/boughtProduct`, productBought);
app.use(`/recaudation`, recaudationRouter);
app.use('/enviarPedidoWhatsapp', enviarProductosWhatsappRoutes);



// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};


  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
