import express from 'express';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get leaderboard - top citizens by points
router.get('/leaderboard', authenticate, async (req, res) => {
    try {
        const leaderboard = await User.find({ role: 'civic' })
            .select('name email points')
            .sort({ points: -1 })
            .limit(100)
            .lean();

        const rankedLeaderboard = leaderboard.map((user, index) => ({
            rank: index + 1,
            id: user._id,
            name: user.name,
            email: user.email,
            points: user.points || 0,
        }));

        res.json(rankedLeaderboard);
    } catch (err) {
        console.error('Leaderboard error:', err);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

export default router;
