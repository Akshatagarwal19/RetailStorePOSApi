import { DataTypes } from 'sequelize';
import sequelize from '../config/db.config.js';
import Transaction from "../models/transaction.model.js";

const Product = sequelize.define(
  'Product', 
  {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  category_id: {
    type: DataTypes.UUID,
    references: {
      model: 'categories',
      key: 'id'
    },
  },
  image_path: {
    type: DataTypes.STRING,
    allowNull:true,
  }
}, {
  tableName: 'products',
  freezeTableName: true,
  timestamps: true,
});


export default Product;
