import express from 'express';
import authController from '../controllers/auth.controller.js';
import { validateUserLogin,validateUserRegistration,validateJWT } from '../utils/validation.js';

const router = express.Router();

router.post('/login', validateUserLogin, authController.login);
router.post('/register', validateUserRegistration, authController.register);
router.post('/logout', authController.logout);

export default router;