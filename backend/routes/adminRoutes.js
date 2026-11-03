import express from 'express';

import {
    getAllUsers,
    searchUsers,
    addUser,
    editUser,
    deleteUser
} from '../controllers/adminController.js';

import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';

const router = express.Router();

// All routes below require admin authentication
router.use(protect, adminOnly);
router.get('/users', getAllUsers);
router.get('/users/search', searchUsers);
router.post('/users', addUser);
router.put('/users/:id', editUser);
router.delete('/users/:id', deleteUser);

export default router;