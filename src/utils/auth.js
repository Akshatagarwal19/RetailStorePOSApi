import jwt from 'jsonwebtoken';
import User from '../models/user.model';

const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) return res.status(403).json({ message: 'Invalid token' });
            req.user = user; // Assuming user object contains the user ID
            next();
        });
    } else {
        res.status(401).json({ message: 'Authorization token missing' });
    }
};

export default authenticateToken;
