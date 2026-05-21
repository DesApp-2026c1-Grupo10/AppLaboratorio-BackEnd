/* eslint-disable no-console */
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import logger from 'morgan';
import routes from './routes';
import config from './config/config';

// Importamos las rutas específicas (usando import como pide tu semilla)
import pedidosRoutes from './routes/pedidos';
import laboratoriosRoutes from './routes/laboratorios';
import usuariosRoutes from './routes/usuarios';
import inventarioRoutes from './routes/inventario';

const app = express();

// --- MIDDLEWARES ---
app.use(cors()); // Permite que el front (5173) hable con el back (3001)
app.use(helmet()); // Seguridad
app.use(compression()); // Optimización
app.use(logger('dev')); // Logs en consola
app.use(express.json()); // Para que entienda los JSON que envía el front
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// --- RUTAS ---
// Estas son las que venimos trabajando para el Sprint
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/laboratorios', laboratoriosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/inventario', inventarioRoutes);

// Ruta general de la semilla (por si tu compañero agregó cosas ahí)
app.use('/', routes);

// Configuración del puerto desde tu config/config.js
app.set('port', config.port || '3001');

export default app;
