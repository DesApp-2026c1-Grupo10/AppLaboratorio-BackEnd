/* eslint-disable no-console */
import compression from 'compression';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import logger from 'morgan';
import routes from './routes';
import config from './config/config';

const express = require("express")
const cors = require("cors")
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const pedidosRoutes = require("./routes/pedidos");
const laboratoriosRoutes = require("./routes/laboratorios");
const usuarioRoutes = require("./routes/usuarios");

/**
 * Get port from environment and store in Express.
*/

app.use("/pedidos", pedidosRoutes);
app.use("/laboratorios", laboratoriosRoutes);
app.use("/usuarios", usuarioRoutes);

app.set('port', config.port || '3001');

app.use(logger('dev'));
app.use(cookieParser());
app.use(helmet());
app.use(compression());

app.use('/', routes);

module.exports = app;
