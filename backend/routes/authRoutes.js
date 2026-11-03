import express from 'express';

import {
    registerUser,
    loginUser,
    logoutUser,
    loginAdmin,
    getCurrentUser
} from '../controllers/authController.js';

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getCurrentUser);
router.post('/logout', logoutUser);

router.post('/admin/login', loginAdmin);

export default router;