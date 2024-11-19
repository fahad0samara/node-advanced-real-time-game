import { Socket } from 'socket.io';
import { redisClient } from './redis';
import { logger } from '../utils/logger';

const CHAT_HISTORY_LIMIT = 50;
const MESSAGE_RATE_LIMIT = 10; // messages per 10 seconds

interface ChatMessage {
  userId: string;
  username: string;
  content: string;
  timestamp: number;
  channel: string;
}

class RateLimiter {
  private messages: Map<string, number[]> = new Map();

  isAllowed(userId: string): boolean {
    const now = Date.now();
    const userMessages = this.messages.get(userId) || [];
    
    // Remove messages older than 10 seconds
    const recentMessages = userMessages.filter(time => now - time < 10000);
    this.messages.set(userId, recentMessages);

    return recentMessages.length < MESSAGE_RATE_LIMIT;
  }

  addMessage(userId: string): void {
    const messages = this.messages.get(userId) || [];
    messages.push(Date.now());
    this.messages.set(userId, messages);
  }
}

const rateLimiter = new RateLimiter();

export function handleChat(socket: Socket) {
  const userId = socket.data.user.userId;
  const username = socket.data.user.username;

  socket.on('joinChannel', async (channel: string) => {
    try {
      socket.join(channel);
      const history = await getChatHistory(channel);
      socket.emit('chatHistory', history);
    } catch (error) {
      logger.error('Join channel error:', error);
    }
  });

  socket.on('sendMessage', async (data: { channel: string; content: string }) => {
    try {
      if (!rateLimiter.isAllowed(userId)) {
        socket.emit('chatError', { message: 'Rate limit exceeded' });
        return;
      }

      const message: ChatMessage = {
        userId,
        username,
        content: data.content,
        timestamp: Date.now(),
        channel: data.channel
      };

      // Check for suspicious behavior
      if (await isMessageSuspicious(message)) {
        logger.warn('Suspicious message detected:', { userId, message: data.content });
        socket.emit('chatError', { message: 'Message blocked by security filter' });
        return;
      }

      rateLimiter.addMessage(userId);
      await saveChatMessage(message);
      socket.to(data.channel).emit('newMessage', message);
    } catch (error) {
      logger.error('Send message error:', error);
    }
  });
}

async function saveChatMessage(message: ChatMessage): Promise<void> {
  const key = `chat:${message.channel}`;
  await redisClient.lPush(key, JSON.stringify(message));
  await redisClient.lTrim(key, 0, CHAT_HISTORY_LIMIT - 1);
}

async function getChatHistory(channel: string): Promise<ChatMessage[]> {
  const key = `chat:${channel}`;
  const messages = await redisClient.lRange(key, 0, CHAT_HISTORY_LIMIT - 1);
  return messages.map(msg => JSON.parse(msg));
}

async function isMessageSuspicious(message: ChatMessage): Promise<boolean> {
  // Basic content filtering
  const suspiciousPatterns = [
    /\b(hack|cheat|exploit)\b/i,
    /\b(buy|sell)\b.*\b(coins|gold|items)\b/i,
    /\b(password|email)\b/i
  ];

  return suspiciousPatterns.some(pattern => pattern.test(message.content));
}