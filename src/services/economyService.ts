import { redisClient } from './redis';
import { WalletModel, ItemModel, InventoryModel } from '../models';
import { logger } from '../utils/logger';

export class EconomyService {
  private static instance: EconomyService;
  private readonly PRICE_UPDATE_INTERVAL = 300000; // 5 minutes

  private constructor() {
    this.startPriceUpdateJob();
  }

  static getInstance(): EconomyService {
    if (!EconomyService.instance) {
      EconomyService.instance = new EconomyService();
    }
    return EconomyService.instance;
  }

  async transferCurrency(
    fromUserId: string,
    toUserId: string,
    amount: number,
    description: string
  ): Promise<boolean> {
    const session = await WalletModel.startSession();
    session.startTransaction();

    try {
      const fromWallet = await WalletModel.findOne({ userId: fromUserId }).session(session);
      const toWallet = await WalletModel.findOne({ userId: toUserId }).session(session);

      if (!fromWallet || !toWallet || fromWallet.balance < amount) {
        throw new Error('Invalid transfer');
      }

      fromWallet.balance -= amount;
      toWallet.balance += amount;

      const transaction = {
        fromUserId,
        toUserId,
        amount,
        type: 'transfer',
        description,
        timestamp: new Date()
      };

      fromWallet.transactions.push(transaction);
      toWallet.transactions.push(transaction);

      await fromWallet.save();
      await toWallet.save();
      await session.commitTransaction();

      return true;
    } catch (error) {
      await session.abortTransaction();
      logger.error('Transfer error:', error);
      return false;
    } finally {
      session.endSession();
    }
  }

  async purchaseItem(
    userId: string,
    itemId: string,
    quantity: number = 1
  ): Promise<boolean> {
    const session = await WalletModel.startSession();
    session.startTransaction();

    try {
      const [wallet, item, inventory] = await Promise.all([
        WalletModel.findOne({ userId }).session(session),
        ItemModel.findById(itemId).session(session),
        InventoryModel.findOne({ userId }).session(session)
      ]);

      if (!wallet || !item || !inventory) {
        throw new Error('Invalid purchase');
      }

      const totalCost = item.currentPrice * quantity;
      if (wallet.balance < totalCost || item.currentSupply < quantity) {
        throw new Error('Insufficient funds or supply');
      }

      // Update wallet
      wallet.balance -= totalCost;
      wallet.transactions.push({
        toUserId: userId,
        amount: totalCost,
        type: 'debit',
        itemId,
        description: `Purchased ${quantity}x ${item.name}`,
        timestamp: new Date()
      });

      // Update inventory
      const existingItem = inventory.items.find(i => i.itemId === itemId);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        inventory.items.push({
          itemId,
          quantity,
          durability: item.durability,
          attributes: {}
        });
      }

      // Update item supply
      item.currentSupply -= quantity;

      await Promise.all([
        wallet.save(),
        inventory.save(),
        item.save()
      ]);

      await session.commitTransaction();
      await this.updateItemPrice(itemId);

      return true;
    } catch (error) {
      await session.abortTransaction();
      logger.error('Purchase error:', error);
      return false;
    } finally {
      session.endSession();
    }
  }

  private async updateItemPrice(itemId: string): Promise<void> {
    const item = await ItemModel.findById(itemId);
    if (!item) return;

    const supplyRatio = item.currentSupply / item.maxSupply;
    const priceMultiplier = Math.max(0.5, Math.min(2, 1 / supplyRatio));
    
    item.currentPrice = Math.round(item.basePrice * priceMultiplier);
    await item.save();
  }

  private startPriceUpdateJob(): void {
    setInterval(async () => {
      try {
        const items = await ItemModel.find({});
        for (const item of items) {
          await this.updateItemPrice(item.id);
        }
      } catch (error) {
        logger.error('Price update error:', error);
      }
    }, this.PRICE_UPDATE_INTERVAL);
  }
}