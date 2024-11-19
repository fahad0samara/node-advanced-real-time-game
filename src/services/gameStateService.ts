import mongoose, { Document, Schema } from 'mongoose';
import { logger } from '../utils/logger';

interface GameState extends Document {
  roomId: string;
  players: string[];
  state: any;
  startTime: Date;
  endTime?: Date;
  winner?: string;
}

const gameStateSchema = new Schema<GameState>({
  roomId: { type: String, required: true, unique: true },
  players: [{ type: String, required: true }],
  state: { type: Schema.Types.Mixed, required: true },
  startTime: { type: Date, required: true },
  endTime: Date,
  winner: String
});

const GameStateModel = mongoose.model<GameState>('GameState', gameStateSchema);

export async function saveGameState(roomId: string, state: any): Promise<void> {
  try {
    await GameStateModel.findOneAndUpdate(
      { roomId },
      {
        $set: {
          players: state.players,
          state: state.state,
          startTime: new Date(state.lastUpdate)
        }
      },
      { upsert: true }
    );
  } catch (error) {
    logger.error('Save game state error:', error);
    throw error;
  }
}

export async function getGameHistory(userId: string): Promise<GameState[]> {
  return GameStateModel.find({
    players: userId,
    endTime: { $exists: true }
  }).sort({ endTime: -1 });
}

export async function finalizeGame(roomId: string, winner: string): Promise<void> {
  await GameStateModel.findOneAndUpdate(
    { roomId },
    {
      $set: {
        endTime: new Date(),
        winner
      }
    }
  );
}