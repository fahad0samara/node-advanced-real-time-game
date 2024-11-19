import { Express } from 'express';
import { authRoutes } from './auth';
import { gameRoutes } from './game';
import { economyRoutes } from './economy';
import { requireAuth } from '../middleware/auth';

export function setupRoutes(app: Express) {
  app.use('/auth', authRoutes);
  app.use('/api/games', requireAuth, gameRoutes);
  app.use('/api/economy', requireAuth, economyRoutes);
}