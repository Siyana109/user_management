import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import cloudinary from '../config/cloudinary.js';

// View All Users
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'user' })
            .select('-password -profileImageId')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: users.length,
            users
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch users'
        });
    }
};


// Search Users
export const searchUsers = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query || !query.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        const users = await User.find({
            role: 'user',
            $or: [
                { name: { $regex: query.trim(), $options: 'i' } },
                { email: { $regex: query.trim(), $options: 'i' } }
            ]
        })
            .select('-password -profileImageId')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: users.length,
            users
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: 'Search failed'
        });
    }
};


// Add User
export const addUser = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, email and password are required'
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(normalizedEmail)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email address'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must contain at least 6 characters'
            });
        }

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Email already exists'
            });
        }

        if (phone && phone.trim()) {
            const digits = phone.trim().replace(/[\s\-+().]/g, '');
            if (!/^\d+$/.test(digits)) {
                return res.status(400).json({
                    success: false,
                    message: 'Phone number must contain only digits and valid characters'
                });
            }
            if (digits.length !== 10) {
                return res.status(400).json({
                    success: false,
                    message: 'Phone number must be exactly 10 digits'
                });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            phone: phone || '',
            role: 'user'
        });

        return res.status(201).json({
            success: true,
            message: 'User added successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: 'Failed to add user'
        });
    }
};


// Edit User
export const editUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone } = req.body;

        const user = await User.findOne({
            _id: id,
            role: 'user'
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (name !== undefined) {
            if (!name.trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'Name cannot be empty'
                });
            }

            user.name = name.trim();
        }

        if (email !== undefined) {
            const normalizedEmail = email.toLowerCase().trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(normalizedEmail)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid email address'
                });
            }

            const existingUser = await User.findOne({
                email: normalizedEmail,
                _id: { $ne: id }
            });

            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: 'Email already exists'
                });
            }

            user.email = normalizedEmail;
        }

        if (phone !== undefined) {
            if (phone.trim()) {
                const digits = phone.trim().replace(/[\s\-+().]/g, '');
                if (!/^\d+$/.test(digits)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Phone number must contain only digits and valid characters'
                    });
                }
                if (digits.length !== 10) {
                    return res.status(400).json({
                        success: false,
                        message: 'Phone number must be exactly 10 digits'
                    });
                }
            }
            user.phone = phone.trim();
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: 'User updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                profileImage: user.profileImage,
                role: user.role
            }
        });

    } catch (error) {
        console.error(error);

        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Failed to update user'
        });
    }
};


// Delete User
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findOne({
            _id: id,
            role: 'user'
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Delete profile image from Cloudinary
        if (user.profileImageId) {
            try {
                await cloudinary.uploader.destroy(user.profileImageId);
            } catch (error) {
                console.error('Cloudinary deletion failed:', error.message);
            }
        }

        await user.deleteOne();

        return res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });

    } catch (error) {
        console.error(error);

        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Failed to delete user'
        });
    }
};