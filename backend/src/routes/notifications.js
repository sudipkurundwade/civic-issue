import express from 'express';
import Notification from '../models/Notification.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get notifications for current user
router.get('/', authenticate, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    res.json(notifications.map((n) => ({ ...n, id: n._id })));
  } catch (err) {
    console.error('Get notifications error:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark a single notification as read
router.patch('/:id/read', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: req.user.id },
      { read: true },
      { new: true }
    ).lean();

    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    res.json({ ...notification, id: notification._id });
  } catch (err) {
    console.error('Mark notification read error:', err);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// Mark all notifications as read
router.patch('/read-all', authenticate, async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user.id, read: false }, { $set: { read: true } });
    res.json({ ok: true });
  } catch (err) {
    console.error('Mark all notifications read error:', err);
    res.status(500).json({ error: 'Failed to update notifications' });
  }
});

export default router;

