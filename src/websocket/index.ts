import { Server, Socket } from 'socket.io';
import { verifyToken } from '../auth/jwt';
import { handleMatchmaking } from './matchmaking';
import { handleGameEvents } from './gameEvents';
import { handleChat } from '../services/chatService';
import { logger } from '../utils/logger';

export function setupWebSocket(io: Server) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const user = await verifyToken(token);
      socket.data.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    logger.info(`Client connected: ${socket.id}`);
    
    handleMatchmaking(socket);
    handleGameEvents(socket);
    handleChat(socket);

    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });
}