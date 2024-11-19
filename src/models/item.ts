import mongoose, { Document, Schema } from 'mongoose';

export interface Item extends Document {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  basePrice: number;
  currentPrice: number;
  maxSupply: number;
  currentSupply: number;
  durability?: number;
  attributes: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const itemSchema = new Schema<Item>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  rarity: { 
    type: String, 
    required: true,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary']
  },
  basePrice: { type: Number, required: true },
  currentPrice: { type: Number, required: true },
  maxSupply: { type: Number, required: true },
  currentSupply: { type: Number, required: true },
  durability: { type: Number },
  attributes: { type: Map, of: Schema.Types.Mixed },
}, { timestamps: true });

itemSchema.index({ name: 1 });
itemSchema.index({ rarity: 1 });
itemSchema.index({ currentPrice: 1 });

export const ItemModel = mongoose.model<Item>('Item', itemSchema);