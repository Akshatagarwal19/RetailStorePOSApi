import { DataTypes } from 'sequelize';
import sequelize from '../config/db.config.js'; // Adjust the import based on your project structure

const TransactionItem = sequelize.define('transaction_items', {
    product_id: {
        type: DataTypes.UUID,
        allowNull: true
    },
    transaction_Id: {
        type: DataTypes.UUID,
        allowNull: true
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: true // Allow null if you don't want to enforce a quantity value
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
    }
}, {
    timestamps: true, // This ensures Sequelize handles createdAt and updatedAt automatically
    tableName: 'transaction_items' // Make sure the table name matches your database table
});

export default TransactionItem;
