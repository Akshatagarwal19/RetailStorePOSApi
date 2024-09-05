import multer from 'multer';
import path from 'path';
import Product from '../models/product.model.js';
import Category from '../models/category.model.js';
import  pkg  from 'pdfkit';
import { error } from 'console';
import { Where } from 'sequelize/lib/utils';

const { file } = pkg;

// Configuring multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    if (!file){
      return cb(new Error('No file provided'), false);
    }
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage }).single('image');

const productController = {
  getAllProducts: async (req, res) => {
    try {
      const products = await Product.findAll();
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching products', error });
    }
  },

  createProduct: async (req, res) => {
    try {
        // Check if there's an image file
        if (!req.file) {
            return res.status(400).json({ message: 'Image is required' });
        }

        // Extract data from the request
        const { name, price, stock, description, category_name } = req.body;
        const image_path = req.file.path;

        console.log("Product Data Received:", { name, price, stock, description, category_name });
        
        // Find the category by name
        const foundCategory = await Category.findOne({ where: { name: category_name } });
        if (!foundCategory) {
            return res.status(400).json({ message: 'Category not found' });
        }

        // Create the product
        const newProduct = await Product.create({
            name,
            price,
            stock,
            description,
            category_id: foundCategory.id,
            image_path,
        });

        // Respond with the created product
        res.status(201).json(newProduct);
    } catch (error) {
        console.error("Error creating product:", error);
        return res.status(500).json({ message: 'Error creating product', error });
    }
  },

  getProductById: async (req, res) => {
    try {
      const product = await Product.findByPk(req.params.id);
      if (!product) {
          return res.status(404).json({ message: 'Product not found' });
      }
      res.status(200).json(product)
    }catch (error) {
        res.status(500).json({ message: 'Error fetching product', error });
    }
  },
  
  updateProduct: async (req, res) => {
    // Extract fields from the request body
    const { name, price, stock, description, category_name } = req.body;
    const image_path = req.file ? req.file.path : req.body.image_path;
  
    // Check if there's at least one field to update
    if (!name && !price && !stock && !description && !category_name && !image_path) {
      return res.status(400).json({ message: 'No fields to update' });
    }
  
    try {
      // Prepare the updated data object
      const updatedData = {};
  
      // Add fields to the updated data object if they are present
      if (name) updatedData.name = name;
      if (price) updatedData.price = price;
      if (stock) updatedData.stock = stock;
      if (description) updatedData.description = description;
      if (category_name) {
        const foundCategory = await Category.findOne({ where: { name: category_name } });
        if (foundCategory) {
          updatedData.category_id = foundCategory.id;
        } else {
          return res.status(400).json({ message: 'Category not found' });
        }
      }
      if (image_path) updatedData.image_path = image_path;
  
      // Update the product with the provided fields
      const [updated] = await Product.update(updatedData, {
        where: { id: req.params.id }
      });
  
      if (updated) {
        const updatedProduct = await Product.findByPk(req.params.id);
        res.status(200).json(updatedProduct);
      } else {
        res.status(404).json({ message: 'Product not found' });
      }
    } catch (error) {
      console.error('Unable to update product:', error);
      res.status(500).json({ message: 'Unable to update product', error });
    }
  },


  deleteProduct: async (req, res) => {
    try {
      const product = await Product.findByPk(req.params.id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      // Delete the product
      await product.destroy();
      res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
      console.error('Unable to delete product:', error);
      res.status(500).json({ message: 'Unable to delete product', error });
    }
  },
  
};


export default productController;
