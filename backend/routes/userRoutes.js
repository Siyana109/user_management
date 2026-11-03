import express from 'express';
import upload from '../middleware/uploadMiddleware.js';
import {
    getProfile,
    updateProfile,
    uploadProfileImage
} from '../controllers/userController.js';

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/profile/image', protect, 
            upload.single('profileImage'), uploadProfileImage);


export default router;