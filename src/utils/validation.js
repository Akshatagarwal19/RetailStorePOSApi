import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/user.model.js';
import { param } from 'express-validator';


// Middleware to validate inputs
export const validateInputs = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// validate product input data
export const validateProducts = [
    body('name').notEmpty().withMessage('Name is required'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
    body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log(errors.array()); // Log the validation errors
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];

// validate user login

export const validateUserLogin = [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
    (req ,res ,next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
    next();
    },
];

// validate user registeration

export const validateUserRegistration = [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 8 }).withMessage('Password must be atleast 8 characters long'),
    body('role').optional().isIn(['user', 'admin']).withMessage('Role must be either user or admin'),
    (req ,res ,next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];

// validate user input data
export const validateUser = [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Invalid Email address'),
    body('password').isLength({ min: 8 }).withMessage('Password must be atleast 8 characters long'),
    validateInputs,
];

// Middleware to validate JWT Token
export const validateJWT = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No Token, authorization denied'});
    };

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    }catch(error){
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// Middleware to check for admin role
export const adminOnly = async (req ,res ,next) => {
    const user = await User.findByPk(req.user.id);
    if (user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied: Admins only' });
    }
    next();
};

// Middleware for validating UUIDs in params
export const validateUUID = [
    param('id').isUUID().withMessage('Invalid ID Format'),
    validateInputs,
];

// validations for image uploads
export const validateImageUpload = (req, res, next) => {
    console.log(req.file);
    if (req.method === 'POST' &&!req.file) {
        console.log('File no file uploaded')
        return res.status(400).json({ message: 'No file uploaded' });
    };
    const validTypes = ['image/jpeg','image/png'];
    if (req.file && !validTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ message: 'Invalid file type' });
    }

    next();
};


// Validation for customer
export const validateCustomer = [
    body('name').notEmpty().withMessage('Name is required'),
    body('phone_number').isMobilePhone().withMessage('Invalid Phone Number'),
    body('email').isEmail().withMessage('Invalid email address'),

    // Middleware to check for validation errors
    (req ,res ,next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];
