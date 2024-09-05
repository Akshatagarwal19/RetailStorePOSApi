import { DataTypes } from "sequelize";
import sequelize from "../config/db.config.js";

const User = sequelize.define('User',{
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.STRING,
        defaultValue: 'cashier', //default role
    },
}, {
    tableName: 'Users',
    timestamps: true,
});

export default User;