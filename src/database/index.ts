import { Pool } from 'pg';
import mongoose from 'mongoose';
import { config } from '../config';
import { logger } from '../utils/logger';

// PostgreSQL connection
export const pgPool = new Pool(config.postgres);

// MongoDB connection
export async function setupDatabase() {
  try {
    await mongoose.connect(config.mongodb.uri);
    logger.info('MongoDB connected');
    
    await pgPool.connect();
    logger.info('PostgreSQL connected');
  } catch (error) {
    logger.error('Database connection error:', error);
    process.exit(1);
  }
}