import { Socket } from 'socket.io';
import { redisClient } from '../services/redis';
import { logger } from '../utils/logger';

interface PlayerData {
  userId: string;
  skill: number;
  region: string;
}

const MATCH_TIMEOUT = 30000; // 30 seconds
const SKILL_RANGE = 100;

export function handleMatchmaking(socket: Socket) {
  socket.on('findMatch', async (data: { skill: number; region: string }) => {
    const playerData: PlayerData = {
      userId: socket.data.user.userId,
      skill: data.skill,
      region: data.region
    };

    try {
      await addToMatchmakingQueue(playerData);
      socket.join(`queue:${data.region}`);
      
      // Start matchmaking process
      const match = await findMatch(playerData);
      if (match) {
        const roomId = `game:${Date.now()}`;
        socket.to(match.userId).emit('matchFound', { roomId });
        socket.emit('matchFound', { roomId });
      }
    } catch (error) {
      logger.error('Matchmaking error:', error);
      socket.emit('matchmakingError', { message: 'Failed to find match' });
    }
  });

  socket.on('cancelMatch', async () => {
    try {
      await removeFromMatchmakingQueue(socket.data.user.userId);
      socket.emit('matchCancelled');
    } catch (error) {
      logger.error('Cancel matchmaking error:', error);
    }
  });
}

async function addToMatchmakingQueue(playerData: PlayerData): Promise<void> {
  const key = `matchmaking:${playerData.region}`;
  await redisClient.hSet(key, playerData.userId, JSON.stringify(playerData));
  await redisClient.expire(key, MATCH_TIMEOUT / 1000);
}

async function removeFromMatchmakingQueue(userId: string): Promise<void> {
  const keys = await redisClient.keys('matchmaking:*');
  for (const key of keys) {
    await redisClient.hDel(key, userId);
  }
}

async function findMatch(playerData: PlayerData): Promise<PlayerData | null> {
  const key = `matchmaking:${playerData.region}`;
  const players = await redisClient.hGetAll(key);

  for (const [userId, data] of Object.entries(players)) {
    if (userId === playerData.userId) continue;

    const opponent: PlayerData = JSON.parse(data);
    if (Math.abs(opponent.skill - playerData.skill) <= SKILL_RANGE) {
      await removeFromMatchmakingQueue(userId);
      await removeFromMatchmakingQueue(playerData.userId);
      return opponent;
    }
  }

  return null;
}