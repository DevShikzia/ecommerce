/**
 * Punto de entrada del servidor
 */
import { createApp } from './app';
import { connectDatabase } from './config/database';
import { env } from './config/env';
import { logger } from './utils/logger';

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    const app = await createApp();
    const port = parseInt(env.PORT, 10);

    app.listen(port, () => {
      logger.info(`Servidor ejecutándose en puerto ${port}`);
    });
  } catch (error) {
    logger.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();