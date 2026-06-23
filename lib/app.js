/* eslint-disable no-console */
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import logger from 'morgan';
import routes from './routes';
import config from './config/config';
import errorHandler from './middlewares/error_handler';
import { authMiddleware } from './middlewares/auth';

import pedidosRoutes from './routes/pedidos';
import laboratoriosRoutes from './routes/laboratorios';
import usuariosRoutes from './routes/usuarios';
import inventarioRoutes from './routes/inventario';
import estadisticasRoutes from './routes/estadisticas';
import actividadesPredefinidasRoutes from './routes/actividadesPredefinidas';

const app = express();

app.use(cors());
app.use(helmet());
app.use(compression());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Rutas públicas
app.use('/api/usuarios', usuariosRoutes);

// Rutas protegidas
app.use('/api/pedidos', authMiddleware, pedidosRoutes);
app.use('/api/laboratorios', authMiddleware, laboratoriosRoutes);
app.use('/api/inventario', authMiddleware, inventarioRoutes);
app.use('/api/estadisticas', authMiddleware, estadisticasRoutes);
app.use(
  '/api/actividades-predefinidas',
  authMiddleware,
  actividadesPredefinidasRoutes
);

app.use('/', routes);
app.use(errorHandler);

app.set('port', config.port || '3001');

export default app;
