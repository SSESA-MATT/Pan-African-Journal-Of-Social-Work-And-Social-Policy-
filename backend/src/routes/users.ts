import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticate, requireRole } from '../middleware/auth';
import { validateRequest, updateUserSchema, updateUserRoleSchema, createUserByAdminSchema } from '../utils/validation';

const router = Router();
const userController = new UserController();

/**
 * @route   GET /api/users
 * @desc    Get all users with pagination (admin only)
 * @access  Private (Admin)
 */
router.get('/', authenticate, requireRole(['admin']), userController.getUsers);

/**
 * @route   GET /api/users/stats
 * @desc    Get user statistics (admin only)
 * @access  Private (Admin)
 */
router.get('/stats', authenticate, requireRole(['admin']), userController.getUserStats);

/**
 * @route   GET /api/users/search
 * @desc    Search users (admin/editor)
 * @access  Private (Admin/Editor)
 */
router.get('/search', authenticate, requireRole(['admin', 'editor']), userController.searchUsers);

/**
 * @route   GET /api/users/role/:role
 * @desc    Get users by role (admin/editor)
 * @access  Private (Admin/Editor)
 */
router.get('/role/:role', authenticate, requireRole(['admin', 'editor']), userController.getUsersByRole);

/**
 * @route   POST /api/users
 * @desc    Create user by admin
 * @access  Private (Admin)
 */
router.post('/', authenticate, requireRole(['admin']), validateRequest(createUserByAdminSchema), userController.createUser);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private
 */
router.get('/:id', authenticate, userController.getUserById);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user profile
 * @access  Private (Own profile or Admin)
 */
router.put('/:id', authenticate, validateRequest(updateUserSchema), userController.updateUser);

/**
 * @route   PUT /api/users/:id/role
 * @desc    Update user role (admin only)
 * @access  Private (Admin)
 */
router.put('/:id/role', authenticate, requireRole(['admin']), validateRequest(updateUserRoleSchema), userController.updateUserRole);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user (admin only)
 * @access  Private (Admin)
 */
router.delete('/:id', authenticate, requireRole(['admin']), userController.deleteUser);

export default router;