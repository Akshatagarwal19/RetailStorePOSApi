import { DataTypes } from "sequelize";
import sequelize from "../config/db.config.js";
// import User from "./user.model.js";
import Product from "./product.model.js";

const Transaction = sequelize.define('Transaction',{
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    customerId: {
        type: DataTypes.STRING(24),//Reference to MongoDb's ObjectId
        allowNull: true,
    },
    totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    taxRate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.18, // Default tax rate can be set here
    },
    totalWithTax: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    paymentMethod: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    timestamps: false,//disabling automatic timestamps
    tableName: 'transactions',
    freezeTableName: true,
});


// Sync the model with Database
await sequelize.sync({ alter: true });

export default Transaction;