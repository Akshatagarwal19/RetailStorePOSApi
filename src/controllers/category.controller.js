import Category from "../models/category.model.js";

const categoryController = {
    createCategory : async (req ,res) => {
        try {
            const { name } = req.body;
            const newCategory = await Category.create({ name });
            res.status(201).json(newCategory);
          } catch (error) {
            res.status(500).json({ message: 'Error creating category', error });
          }
    },
    getCategories : async (req ,res) => {
        try {
            const categories = await Category.findAll();
            res.status(200).json(categories);
          } catch (error) {
            res.status(500).json({ message: 'Error fetching categories', error });
          }
    },
    getCategoryById : async (req ,res) => {
        try {
            const { id } = req.params;
            const category = await Category.findByPk(id);
            if (!category) {
              return res.status(404).json({ message: 'Category not found' });
            }
            res.status(200).json(category);
          } catch (error) {
            res.status(500).json({ message: 'Error fetching category', error });
          }        
    },
    updateCategory : async (req ,res) => {
        try {
            const { id } = req.params;
            const { name } = req.body;
            const category = await Category.findByPk(id);
            if (!category) {
              return res.status(404).json({ message: 'Category not found' });
            }
            category.name = name;
            await category.save();
            res.status(200).json(category);
          } catch (error) {
            res.status(500).json({ message: 'Error updating category', error });
          }        
    },  
    deleteCategory : async (req ,res) => {
        try {
            const { id } = req.params;
            const category = await Category.findByPk(id);
            if (!category) {
              return res.status(404).json({ message: 'Category not found' });
            }
            await category.destroy();
            res.status(200).json({ message: 'Category deleted successfully' });
          } catch (error) {
            res.status(500).json({ message: 'Error deleting category', error });
          }
    },
};

export default categoryController;