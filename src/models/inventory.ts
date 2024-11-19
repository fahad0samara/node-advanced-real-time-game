import mongoose, { Document, Schema } from 'mongoose';

export interface InventoryItem extends Document {
  itemId: string;
  quantity: number;
  durability?: number;
  attributes: Record<string, any>;
}

export interface Inventory extends Document {
  userId: string;
  items: InventoryItem[];
  maxSlots: number;
  lastUpdated: Date;
}

const inventoryItemSchema = new Schema<InventoryItem>({
  itemId: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  durability: { type: Number },
  attributes: { type: Map, of: Schema.Types.Mixed }
});

const inventorySchema = new Schema<Inventory>({
  userId: { type: String, required: true, unique: true },
  items: [inventoryItemSchema],
  maxSlots: { type: Number, required: true, default: 50 },
  lastUpdated: { type: Date, default: Date.now }
});

inventorySchema.index({ userId: 1 });
inventorySchema.index({ 'items.itemId': 1 });

export const InventoryModel = mongoose.model<Inventory>('Inventory', inventorySchema);