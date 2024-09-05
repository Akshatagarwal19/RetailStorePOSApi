import express from 'express';
import { validateProducts, validateImageUpload } from '../utils/validation.js';
import multer from 'multer';
import productController from '../controllers/product.controller.js';
import path from 'path';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("File destination:", file); // Log file object to inspect
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    console.log("File being uploaded:", file); // Log file object to inspect
    if (!file) {
      return cb(new Error('No file provided'), false);
    }
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.get('/', productController.getAllProducts);
router.post('/', upload.single('image'), validateProducts, validateImageUpload, productController.createProduct);
router.get('/:id', productController.getProductById);
router.put('/:id', upload.single('image'), validateProducts, validateImageUpload, productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

export default router;
