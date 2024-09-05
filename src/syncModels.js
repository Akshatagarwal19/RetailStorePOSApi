import sequelize from './config/db.config.js'; // Adjust the path to your Sequelize configuration
import TransactionItem from './models/transactionItems.model.js';

(async () => {
    try {
        await sequelize.authenticate(); // Optional: Check if connection to the database is successful
        console.log('Database connection established successfully.');

        await TransactionItem.sync({ alter: true }); // Sync the model with the database
        console.log('TransactionItem model synchronized successfully.');
    } catch (error) {
        console.error('Error synchronizing models:', error);
    } finally {
        await sequelize.close(); // Close the database connection
    }
})();
