import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const email = 'admin@gmail.com';

        const existingAdmin = await User.findOne({ email });

        if (existingAdmin) {
            console.log('Admin already exists');
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash('Admin@123', 10);

        await User.create({
            name: 'Administrator',
            email,
            password: hashedPassword,
            role: 'admin'
        });

        console.log('Admin created successfully');

        process.exit(0);

    } catch (error) {
        console.error('Admin creation failed:', error);
        process.exit(1);
    }
};

createAdmin();