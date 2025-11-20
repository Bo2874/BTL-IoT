import express from 'express';
const router = express.Router();
import {
  getDevices,
  getDevice,
  createDevice,
  updateDevice,
  deleteDevice,
  assignWorkers
} from '../controllers/deviceController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

// All routes require authentication
router.use(protect);

// GET all devices (Admin sees all, Worker sees assigned only)
router.get('/', getDevices);

// GET single device
router.get('/:id', getDevice);

// Admin only routes
router.post('/', authorize('Admin'), createDevice);
router.put('/:id', authorize('Admin'), updateDevice);
router.delete('/:id', authorize('Admin'), deleteDevice);
router.post('/:id/assign', authorize('Admin'), assignWorkers);

export default router;
