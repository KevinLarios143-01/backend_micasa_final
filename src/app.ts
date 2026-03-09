import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middlewares/error.middleware';
import { setupSwagger } from './config/swagger';
import routes from './routes';

export const createApp = (): Express => {
  const app = express();

  // Security middlewares
  app.use(helmet());
  
  // CORS configuration with production validation
  const corsOrigin = process.env.CORS_ORIGIN;
  
  // Validate that wildcard is not used in production
  if (process.env.NODE_ENV === 'production' && (!corsOrigin || corsOrigin === '*')) {
    throw new Error(
      'CORS_ORIGIN must be defined and cannot be "*" in production. ' +
      'Set CORS_ORIGIN to your frontend domain(s).'
    );
  }
  
  app.use(cors({
    origin: corsOrigin || '*',
    credentials: true,
  }));

  // General rate limiting
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: 'Demasiadas solicitudes desde esta IP',
  });
  app.use(limiter);

  // Body parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Compression
  app.use(compression());

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.status(200).json({ 
      status: 'OK', 
      timestamp: new Date(),
      uptime: process.uptime(),
    });
  });

  // Setup Swagger documentation
  setupSwagger(app);

  // Routes
  const apiPrefix = process.env.API_PREFIX || '/api';
  app.use(apiPrefix, routes);

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
};
