import express from 'express';
import categoryController from '../controllers/category.controller.js';
import { validateUUID } from '../utils/validation.js';

const router = express.Router();

router.post('/', categoryController.createCategory);
router.get('/', categoryController.getCategories);
router.get('/:id', validateUUID, categoryController.getCategoryById);
router.put('/:id', validateUUID, categoryController.updateCategory);
router.delete('/:id', validateUUID, categoryController.deleteCategory);

export default router;