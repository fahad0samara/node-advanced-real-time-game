import jwt from 'jsonwebtoken';
import { config } from '../config';
import { User } from '../models/user';

export interface JWTPayload {
  userId: string;
  email: string;
}

export function generateToken(user: User): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email
  };
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '24h' });
}

export async function verifyToken(token: string): Promise<JWTPayload> {
  return jwt.verify(token, config.jwtSecret) as JWTPayload;
}