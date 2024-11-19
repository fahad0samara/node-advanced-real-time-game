import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { EconomyService } from '../services/economyService';
import { WalletModel, ItemModel, InventoryModel } from '../models';

const router = Router();
const economyService = EconomyService.getInstance();

const transferSchema = z.object({
  toUserId: z.string(),
  amount: z.number().positive(),
  description: z.string()
});

const purchaseSchema = z.object({
  itemId: z.string(),
  quantity: z.number().positive()
});

router.post('/transfer', requireAuth, async (req, res) => {
  try {
    const { toUserId, amount, description } = transferSchema.parse(req.body);
    const success = await economyService.transferCurrency(
      req.user.userId,
      toUserId,
      amount,
      description
    );

    if (success) {
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'Transfer failed' });
    }
  } catch (error) {
    res.status(400).json({ error: 'Invalid request' });
  }
});

router.post('/purchase', requireAuth, async (req, res) => {
  try {
    const { itemId, quantity } = purchaseSchema.parse(req.body);
    const success = await economyService.purchaseItem(
      req.user.userId,
      itemId,
      quantity
    );

    if (success) {
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'Purchase failed' });
    }
  } catch (error) {
    res.status(400).json({ error: 'Invalid request' });
  }
});

router.get('/wallet', requireAuth, async (req, res) => {
  try {
    const wallet = await WalletModel.findOne({ userId: req.user.userId });
    res.json(wallet);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch wallet' });
  }
});

router.get('/inventory', requireAuth, async (req, res) => {
  try {
    const inventory = await InventoryModel.findOne({ userId: req.user.userId });
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

router.get('/market', requireAuth, async (req, res) => {
  try {
    const items = await ItemModel.find({ currentSupply: { $gt: 0 } })
      .sort({ currentPrice: 1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch market items' });
  }
});

export const economyRoutes = router;