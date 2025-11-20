import express from 'express';
import {
  getUsers,
  getUser,
  updateUserRole,
  deleteUser,
  updateUser
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Admin only routes
router.get('/', authorize('Admin'), getUsers);
router.get('/:id', authorize('Admin'), getUser);
router.put('/:id/role', authorize('Admin'), updateUserRole);
router.delete('/:id', authorize('Admin'), deleteUser);

// User can update their own profile, Admin can update any
router.put('/:id', updateUser);

export default router;
