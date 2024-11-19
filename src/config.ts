import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const configSchema = z.object({
  port: z.number().default(3000),
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  jwtSecret: z.string(),
  corsOrigins: z.array(z.string()).default(['http://localhost:3000']),
  postgres: z.object({
    host: z.string(),
    port: z.number(),
    database: z.string(),
    user: z.string(),
    password: z.string()
  }),
  mongodb: z.object({
    uri: z.string()
  }),
  redis: z.object({
    host: z.string(),
    port: z.number()
  }),
  oauth: z.object({
    google: z.object({
      clientId: z.string(),
      clientSecret: z.string()
    })
  })
});

export const config = configSchema.parse({
  port: process.env.PORT ? parseInt(process.env.PORT) : undefined,
  nodeEnv: process.env.NODE_ENV,
  jwtSecret: process.env.JWT_SECRET,
  corsOrigins: process.env.CORS_ORIGINS?.split(','),
  postgres: {
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD
  },
  mongodb: {
    uri: process.env.MONGODB_URI
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379')
  },
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }
  }
});