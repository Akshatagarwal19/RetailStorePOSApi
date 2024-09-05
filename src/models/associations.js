import Transaction from './transaction.model.js';
import Product from './product.model.js';

// Define associations after models are defined
Transaction.belongsToMany(Product, {
  through: 'transaction_items',
  as: 'products',
  foreignKey: 'transaction_Id',
  otherKey: 'product_id'
});

Product.belongsToMany(Transaction, {
  through: 'transaction_items',
  as: 'transactions',
  foreignKey: 'product_id',
  otherKey: 'transaction_Id'
});
