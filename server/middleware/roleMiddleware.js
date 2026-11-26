/**
 * Simple role-check middleware factory
 * Usage: ensureRole('client') -> middleware that returns 403 if req.user role doesn't match
 */
import User from '../models/User.js';

export const ensureRole = (role) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: 'User not found' });
      if (user.role !== role) return res.status(403).json({ error: 'Insufficient role' });
      next();
    } catch (err) {
      next(err);
    }
  };
};
