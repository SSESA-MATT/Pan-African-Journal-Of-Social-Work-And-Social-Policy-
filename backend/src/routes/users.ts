import { Router, Request, Response } from 'express';
import User from '../models/User';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// All user routes require authentication
router.use(authenticate);

// ─── GET /api/users — List users (admin only) ─────────────────
router.get('/', requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { role, search, page = '1', limit = '20', isActive } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const query: any = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { affiliation: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .select('-password'),
      User.countDocuments(query),
    ]);

    res.json({
      users: users.map((u) => ({
        id: u.id,
        email: u.email,
        first_name: u.firstName,
        last_name: u.lastName,
        affiliation: u.affiliation,
        role: u.role,
        isActive: u.isActive,
        created_at: u.createdAt,
        updated_at: u.updatedAt,
      })),
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

// ─── GET /api/users/stats — User stats (admin) ───────────────
router.get('/stats', requireRole('admin'), async (_req: Request, res: Response) => {
  try {
    const [roleStats, totalUsers, newThisMonth] = await Promise.all([
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
      User.countDocuments(),
      User.countDocuments({
        createdAt: { $gte: new Date(new Date().setDate(1)) },
      }),
    ]);

    res.json({
      total: totalUsers,
      newThisMonth,
      byRole: Object.fromEntries(roleStats.map((s) => [s._id, s.count])),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user stats.' });
  }
});

// ─── GET /api/users/:id — Single user ─────────────────────────
router.get('/:id', async (req: Request, res: Response) => {
  try {
    // Regular users can only view their own profile
    if (req.userId !== req.params.id && !['admin', 'editor'].includes(req.user!.role)) {
      res.status(403).json({ error: 'Access denied.' });
      return;
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
        affiliation: user.affiliation,
        role: user.role,
        expertise: user.expertise,
        bio: user.bio,
        orcid: user.orcid,
        isActive: user.isActive,
        created_at: user.createdAt,
        updated_at: user.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user.' });
  }
});

// ─── PUT /api/users/:id/role — Update user role (admin) ──────
router.put('/:id/role', requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    if (!['author', 'reviewer', 'editor', 'admin'].includes(role)) {
      res.status(400).json({ error: 'Invalid role.' });
      return;
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update role.' });
  }
});

// ─── PUT /api/users/:id/status — Activate/deactivate (admin) ─
router.put('/:id/status', requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    res.json({ message: `User ${isActive ? 'activated' : 'deactivated'} successfully.` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user status.' });
  }
});

// ─── DELETE /api/users/:id — Delete user (admin) ─────────────
router.delete('/:id', requireRole('admin'), async (req: Request, res: Response) => {
  try {
    // Prevent self-deletion
    if (req.userId === req.params.id) {
      res.status(400).json({ error: 'You cannot delete your own account.' });
      return;
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    res.json({ message: 'User deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user.' });
  }
});

export default router;
