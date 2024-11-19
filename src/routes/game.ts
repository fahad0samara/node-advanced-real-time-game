import { Router } from 'express';
import { getGameHistory } from '../services/gameStateService';

const router = Router();

router.get('/history', async (req, res) => {
  try {
    const games = await getGameHistory(req.user.userId);
    res.json(games);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch game history' });
  }
});

export const gameRoutes = router;