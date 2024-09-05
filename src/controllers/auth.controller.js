import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';

const authController = {
    login: async (req, res) => {
        const { email, password } = req.body;

        try {
            const user = await User.findOne({ where: { email } });
            if (!user) {
                return res.status(400).json({ message: 'Invalid Credentials' });
            }
            
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid credentials' });
            };

            const payload = {
                user: {
                    id: user.id,
                    role: user.role,
                }
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.status(200).json({ token });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error });
        }
    },

    register: async (req, res) => {
        const { name, email, password, role } = req.body;

        try {
            let user = await User.findOne({ where: { email } });
            if (user) {
                return res.status(400).json({ message: 'User already exists, please login' });
            };
            
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            user = await User.create({
                name,
                email,
                password: hashedPassword,
                role: role || 'user',
            });

            res.status(201).json({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                created_at: user.created_at
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error });
        }
    },

    logout: (req, res) => {
        res.status(200).json({ message: 'Logged out successfully' });
    }
};

export default authController;
