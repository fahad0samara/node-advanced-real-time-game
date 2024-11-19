import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { setupRoutes } from './routes';
import { setupWebSocket } from './websocket';
import { setupDatabase } from './database';
import { setupRedis } from './services/redis';
import { setupAuth } from './auth';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { logger } from './utils/logger';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: config.corsOrigins,
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({ origin: config.corsOrigins }));
app.use(helmet());
app.use(express.json());
app.use(rateLimiter);

// Setup
setupDatabase();
setupRedis();
setupAuth(app);
setupRoutes(app);
setupWebSocket(io);

// Error handling
app.use(errorHandler);

// Start server
httpServer.listen(config.port, () => {
  logger.info(`Server running on port ${config.port}`);
});