import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';
import { Readable } from 'stream';



// Get User Profile
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        return res.status(200).json({
            success: true,
            user
        });

    } catch (error) {
        console.error('Get Profile Error:', error);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};


// Update User Profile
export const updateProfile = async (req, res) => {
    try {
        const { name, phone } = req.body;

        const user = await User.findById(req.user._id);

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
            message: 'Profile updated successfully',
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
        console.error('Update Profile Error:', error);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};





const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'user-management/profiles',
                resource_type: 'image'
            },
            (error, result) => {
                if (error) {
                    return reject(error);
                }

                resolve(result);
            }
        );

        Readable.from(buffer).pipe(uploadStream);
    });
};





// Upload Profile Image
export const uploadProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please select an image'
            });
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Upload new image
        const result = await uploadToCloudinary(req.file.buffer);

        // Delete previous image if available
        if (user.profileImageId) {
            try {
                await cloudinary.uploader.destroy(user.profileImageId);
            } catch (error) {
                console.error('Old image deletion failed:', error.message);
            }
        }

        // Save new image details
        user.profileImage = result.secure_url;
        user.profileImageId = result.public_id;

        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Profile image uploaded successfully',
            profileImage: user.profileImage
        });

    } catch (error) {
        console.error('Image Upload Error:', error);

        // Multer file size limit exceeded
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File is too large. Maximum allowed size is 5 MB.'
            });
        }

        // Multer file type rejected
        if (error.message === 'Only image files are allowed') {
            return res.status(400).json({
                success: false,
                message: 'Invalid file type. Only JPG, PNG, and WebP images are allowed.'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Image upload failed. Please try again.'
        });
    }
};