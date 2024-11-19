import { Express } from 'express';
import passport from 'passport';
import { setupPassport } from './passport';
import { authRoutes } from '../routes/auth';

export function setupAuth(app: Express) {
  app.use(passport.initialize());
  setupPassport();
  app.use('/auth', authRoutes);
}