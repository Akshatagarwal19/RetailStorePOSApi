import userController from "../controllers/user.controller.js";
import { validateJWT, adminOnly } from "../utils/validation.js";
import express from 'express';

const router = express.Router();

router.get('/',validateJWT,adminOnly,userController.getAllUsers);
// router.post('/',validateJWT,userController.createUser);
router.get('/:id',validateJWT,adminOnly,userController.getUserById);
router.put('/:id',validateJWT,adminOnly,userController.updateUser);
router.delete('/:id',validateJWT,adminOnly,userController.deleteUser);

export default router;

