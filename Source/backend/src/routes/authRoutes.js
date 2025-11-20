import express from 'express';
const router = express.Router();
import { 
  register, 
  login, 
  logout, 
  getProfile, 
  updateProfile 
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/logout', protect, logout);

export default router;
