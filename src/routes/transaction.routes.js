import transactionController from "../controllers/transaction.controller.js";
import express from 'express';

const router = express.Router();

// Create a new transaction
router.post('/', transactionController.createTransaction);

// Get all transactions
router.get('/', transactionController.getAllTransactions);

// Get a transaction by ID
router.get('/:id', transactionController.getTransactionById);

// Update a transaction by ID (Add this route if needed)
router.put('/:id', transactionController.updateTransaction); // Use PUT or PATCH

// Delete a transaction by ID
router.delete('/:id', transactionController.deleteTransaction);

// Generate an invoice for a transaction by ID
router.get('/invoice/:id', transactionController.generateInvoice);

// Genearate fake data
// router.post('/generate-fake-transactions', transactionController.generateFakeTransactions);

router.get('/weekly/:year/:month/:week', transactionController.getWeeklyReportHandler);
router.get('/monthly/:year/:month', transactionController.getMonthlyReportHandler);
export default router;
