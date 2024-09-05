import { Sequelize } from "sequelize";
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(process.env.POSTGRES_URI, {
  dialect: 'postgres',
  logging: false,
});

// Optionally sync database
sequelize.sync().catch(error => {
  console.error('Unable to connect to the database:', error);
});


export default sequelize;