import { Router } from 'express';
import passport from 'passport';
import { generateToken } from '../auth/jwt';
import { User } from '../models/user';

const router = Router();

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const token = generateToken(req.user as User);
    res.redirect(`/auth-success?token=${token}`);
  }
);

router.get('/me', 
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.json(req.user);
  }
);

export const authRoutes = router;