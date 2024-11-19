import { Socket } from 'socket.io';
import { redisClient } from './redis';
import { logger } from '../utils/logger';

interface PlayerAction {
  userId: string;
  type: string;
  timestamp: number;
  data: any;
}

interface PlayerStats {
  actions: number;
  suspicious: number;
  lastReset: number;
}

const STATS_RESET_INTERVAL = 3600000; // 1 hour
const SUSPICIOUS_THRESHOLD = 0.8;

class AntiCheatSystem {
  private playerStats: Map<string, PlayerStats> = new Map();

  async processAction(action: PlayerAction): Promise<boolean> {
    const stats = this.getPlayerStats(action.userId);
    const isValid = await this.validateAction(action);
    
    if (!isValid) {
      stats.suspicious++;
      await this.logSuspiciousActivity(action);
    }

    stats.actions++;
    const suspiciousRatio = stats.suspicious / stats.actions;

    if (suspiciousRatio > SUSPICIOUS_THRESHOLD) {
      await this.handleCheatingDetected(action.userId);
      return false;
    }

    return true;
  }

  private getPlayerStats(userId: string): PlayerStats {
    const now = Date.now();
    let stats = this.playerStats.get(userId);

    if (!stats || now - stats.lastReset > STATS_RESET_INTERVAL) {
      stats = { actions: 0, suspicious: 0, lastReset: now };
      this.playerStats.set(userId, stats);
    }

    return stats;
  }

  private async validateAction(action: PlayerAction): Promise<boolean> {
    // Implement action validation based on game rules
    switch (action.type) {
      case 'movement':
        return this.validateMovement(action.data);
      case 'combat':
        return this.validateCombat(action.data);
      default:
        return true;
    }
  }

  private validateMovement(data: any): boolean {
    // Check for speed hacks and teleportation
    const { speed, position, lastPosition, timestamp } = data;
    if (!lastPosition) return true;

    const distance = Math.sqrt(
      Math.pow(position.x - lastPosition.x, 2) +
      Math.pow(position.y - lastPosition.y, 2)
    );

    const timeDiff = timestamp - lastPosition.timestamp;
    const calculatedSpeed = distance / timeDiff;

    return calculatedSpeed <= speed * 1.1; // Allow 10% margin for network lag
  }

  private validateCombat(data: any): boolean {
    // Check for rapid fire and damage modification
    const { damage, attackSpeed, timestamp, lastAttack } = data;
    if (!lastAttack) return true;

    const timeBetweenAttacks = timestamp - lastAttack.timestamp;
    return timeBetweenAttacks >= attackSpeed && damage <= data.maxDamage;
  }

  private async logSuspiciousActivity(action: PlayerAction): Promise<void> {
    const key = `suspicious:${action.userId}`;
    await redisClient.lPush(key, JSON.stringify({
      ...action,
      detectedAt: Date.now()
    }));
  }

  private async handleCheatingDetected(userId: string): Promise<void> {
    logger.warn('Cheating detected:', { userId });
    await redisClient.set(`banned:${userId}`, Date.now().toString(), {
      EX: 3600 // 1-hour ban
    });
  }
}

export const antiCheat = new AntiCheatSystem();