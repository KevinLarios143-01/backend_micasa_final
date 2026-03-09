import dotenv from 'dotenv';
import { createApp } from './app';
import { logger } from './utils/logger';
import { prisma } from './config/database';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Verify database connection
    await prisma.$connect();
    logger.info('Database connection established');

    const app = createApp();
    
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      if (process.env.SWAGGER_ENABLED === 'true') {
        logger.info(`API Documentation: http://localhost:${PORT}${process.env.SWAGGER_PATH || '/api-docs'}`);
      }
    });

    // Handle graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, closing server...');
      await prisma.$disconnect();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      logger.info('SIGINT received, closing server...');
      await prisma.$disconnect();
      process.exit(0);
    });

  } catch (error) {
    logger.error('Error starting server:', error);
    process.exit(1);
  }
};

startServer();
