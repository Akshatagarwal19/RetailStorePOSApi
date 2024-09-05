import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
// Load or import environment variables
import dotenv from 'dotenv';
// Database imports
import './src/config/mongodb.config.js'
import sequelize from './src/config/db.config.js';
// Route Imports
import customerRoutes from './src/routes/customer.routes.js';
import productRoutes from './src/routes/product.routes.js';
import transactionRoutes from './src/routes/transaction.routes.js';
import userRoutes from './src/routes/user.routes.js';
import authRoutes from './src/routes/auth.routes.js';
import categoryRoutes from './src/routes/category.routes.js';
import './src/models/associations.js'
dotenv.config();

const app = express();

const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to the Retail POS System');
});

// Routes
app.use('/RetailStorePOSAppAPI/v1/customers', customerRoutes);
app.use('/RetailStorePOSAppAPI/v1/products', productRoutes);
app.use('/RetailStorePOSAppAPI/v1/transactions', transactionRoutes);
app.use('/RetailStorePOSAppAPI/v1/users', userRoutes);
app.use('/RetailStorePOSAppAPI/v1/auth', authRoutes);
app.use('/RetailStorePOSAppAPI/v1/categories',categoryRoutes);
app.use('/uploads', express.static('uploads'));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  sequelize.authenticate().then(() => {
    console.log('PostgreSQL connected');
  }).catch(err => {
    console.error('Unable to connect to PostgreSQL:', err);
  });
});
