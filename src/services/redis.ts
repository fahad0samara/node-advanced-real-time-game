import { createClient } from 'redis';
import { config } from '../config';
import { logger } from '../utils/logger';

export const redisClient = createClient({
  socket: {
    host: config.redis.host,
    port: config.redis.port
  }
});

export async function setupRedis() {
  try {
    await redisClient.connect();
    logger.info('Redis connected');
  } catch (error) {
    logger.error('Redis connection error:', error);
    process.exit(1);
  }
}