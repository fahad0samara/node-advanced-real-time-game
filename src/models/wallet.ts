import mongoose, { Document, Schema } from 'mongoose';

export interface Transaction extends Document {
  fromUserId?: string;
  toUserId: string;
  amount: number;
  type: 'credit' | 'debit' | 'transfer';
  itemId?: string;
  description: string;
  timestamp: Date;
}

export interface Wallet extends Document {
  userId: string;
  balance: number;
  transactions: Transaction[];
  lastUpdated: Date;
}

const transactionSchema = new Schema<Transaction>({
  fromUserId: { type: String },
  toUserId: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { 
    type: String,
    required: true,
    enum: ['credit', 'debit', 'transfer']
  },
  itemId: { type: String },
  description: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const walletSchema = new Schema<Wallet>({
  userId: { type: String, required: true, unique: true },
  balance: { type: Number, required: true, default: 0 },
  transactions: [transactionSchema],
  lastUpdated: { type: Date, default: Date.now }
});

walletSchema.index({ userId: 1 });
walletSchema.index({ 'transactions.timestamp': -1 });

export const WalletModel = mongoose.model<Wallet>('Wallet', walletSchema);