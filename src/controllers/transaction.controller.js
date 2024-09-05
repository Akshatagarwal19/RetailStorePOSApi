import Transaction from "../models/transaction.model.js";
import TransactionItem from "../models/transactionItems.model.js";
import Product from "../models/product.model.js";
import Customer from "../models/customer.model.js";
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from "path";
import sequelize from "../config/db.config.js";
import { Op, Sequelize } from "sequelize";
import { fileURLToPath } from 'url';
import { faker } from '@faker-js/faker';
import { startOfWeek, endOfWeek, addWeeks, addDays, format, setWeek,endOfDay } from 'date-fns';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getExistingData = async () => {
    const customers = await Customer.find();
    const products = await Product.findAll();
    return { customers, products };
};

const generateFakeTransactions = async (numTransactions) => {
    const { customers, products } = await getExistingData();

    for (let i = 0; i < numTransactions; i++) {
        const customer = customers[Math.floor(Math.random() * customers.length)];
        const product = products[Math.floor(Math.random() * products.length)];

        const randomDate = faker.date.between('2024-08-01', new Date());
        const quantity = faker.datatype.number({ min: 1, max: 10 });
        const price = product.price;
        const totalAmount = quantity * price;
        const taxRate = 0.18;
        const totalWithTax = totalAmount + totalAmount * taxRate;

        const newTransaction = await Transaction.create({
            customerId: customer.id,
            totalAmount,
            taxRate,
            totalWithTax,
            paymentMethod: faker.finance.transactionType(),
            createdAt: randomDate,
            updatedAt: randomDate,
        });

        await TransactionItem.create({
            product_id: product.id,
            quantity: quantity,
            transaction_Id: newTransaction.id,
            createdAt: randomDate,
            updatedAt: randomDate,
        });

        product.stock -= quantity;
        await product.save();
    }

    return { message: `${numTransactions} fake transactions created successfully` };
};

const getWeeklySalesReport = async (year, weekNumber) => {
    try {
        const startDate = startOfWeek(new Date(year, 0, 1), { weekStartsOn: 1 });
        const startOfWeekDate = addWeeks(startDate, weekNumber - 1);
        const endOfWeekDate = endOfWeek(startOfWeekDate);

        const transactions = await Transaction.findAll({
            where: {
                createdAt: {
                    [Op.between]: [startOfWeekDate, endOfWeekDate],
                },
            },
        });

        const totalTransactions = transactions.length;
        const totalSales = transactions.reduce((sum, transaction) => sum + parseFloat(transaction.totalAmount), 0);

        return {
            week: format(startOfWeekDate, 'wo'), // Week number
            startDate: format(startOfWeekDate, 'yyyy-MM-dd'),
            endDate: format(endOfWeekDate, 'yyyy-MM-dd'),
            totalTransactions: totalTransactions,
            totalSales: totalSales.toFixed(2), // Ensure totalSales is a number
        };
    } catch (error) {
        console.error('Error fetching weekly sales report:', error);
        throw new Error('Error fetching weekly sales report');
    }
};

const getMonthlySalesReport = async (year, month) => {
    try {
        const validMonth = Math.max(1, Math.min(12, parseInt(month, 10)));
        const startDate = new Date(year, validMonth - 1, 1);
        const endDate = new Date(year, validMonth, 0);

        const transactions = await Transaction.findAll({
            where: {
                createdAt: {
                    [Op.between]: [startDate, endDate],
                },
            },
        });

        const totalTransactions = transactions.length;
        const totalSales = transactions.reduce((sum, transaction) => sum + parseFloat(transaction.totalAmount), 0);

        return {
            startDate: format(startDate, 'yyyy-MM-dd'),
            endDate: format(endDate, 'yyyy-MM-dd'),
            totalTransactions,
            totalSales: totalSales.toFixed(2),
        };
    } catch (error) {
        console.error('Error fetching monthly sales report:', error);
        throw new Error('Error fetching monthly sales report');
    }
};

const transactionController = {
    createTransaction: async (req, res) => {
        let transaction;
        try {
            transaction = await sequelize.transaction();

            const { customerId, products, paymentMethod } = req.body;

            const productDetails = await Product.findAll({
                where: {
                    id: products.map(p => p.productId)
                }
            });

            if (productDetails.length !== products.length) {
                return res.status(400).json({ message: 'Some products not found in the database' });
            }

            const totalAmount = productDetails.reduce((sum, product) => {
                const quantity = products.find(p => p.productId === product.id).quantity;
                return sum + (product.price * quantity);
            }, 0);

            const taxRate = 0.18;
            const totalWithTax = totalAmount + (totalAmount * taxRate);

            if (!totalWithTax) {
                return res.status(400).json({ message: 'Error calculating total with tax' });
            }

            const newTransaction = await Transaction.create({
                customerId,
                totalAmount,
                taxRate,
                totalWithTax,
                paymentMethod,
            }, { transaction });

            const transactionItems = products.map(product => {
                const productDetail = productDetails.find(p => p.id === product.productId);
                return {
                    product_id: productDetail.id,
                    quantity: product.quantity,
                    transaction_Id: newTransaction.id
                };
            });

            await Promise.all(products.map(async (product) => {
                const productDetail = productDetails.find(p => p.id === product.productId);
                productDetail.stock -= product.quantity;
                await productDetail.save({ transaction });
            }));

            try {
                transactionItems.forEach(item => {
                    if (item.quantity === null || item.quantity === undefined) {
                        throw new Error(`Quantity is not set for product_id: ${item.product_id}`);
                    }
                });

                console.log('Transaction Items before insert:', transactionItems);

                await TransactionItem.bulkCreate(transactionItems, { transaction });

                console.log('Transaction Items Inserted');
            } catch (error) {
                console.error('Error inserting transaction items:', error);
                await transaction.rollback();
                return res.status(500).json({ message: 'Error inserting transaction items', error });
            }

            await transaction.commit();
            res.status(201).json({ message: 'Transaction created successfully', transaction: newTransaction });
        } catch (error) {
            console.error('Error creating transaction:', error);
            if (transaction) await transaction.rollback();
            res.status(500).json({ message: 'Error Creating Transaction', error });
        }
    },

    getAllTransactions: async (req, res) => {
        try {
            const transactions = await Transaction.findAll({
                include: [
                    {
                        model: Product,
                        as: 'products'
                    }
                ]
            });
            console.log(transactions);
            res.status(200).json(transactions);
        } catch (error) {
            console.error('Error Fetching Transactions:', error);
            res.status(500).json({ message: 'Error Fetching Transactions', error });
        }
    },

    getTransactionById: async (req, res) => {
        try {
            const transaction = await Transaction.findByPk(req.params.id, {
                include: [
                    {
                        model: Product,
                        as: 'products'
                    }
                ],
            });
            console.log(transaction);
            if (!transaction) {
                return res.status(404).json({ message: 'Transaction not found' });
            }
            res.status(200).json(transaction);
        } catch (error) {
            res.status(500).json({ message: 'Error Getting Transaction', error });
        }
    },

    updateTransaction: async (req, res) => {
        try {
            const { transactionId } = req.params;
            const { customerId, paymentMethod, items } = req.body;

            const transaction = await Transaction.findByPk(transactionId);

            if (!transaction) {
                return res.status(404).json({ message: 'Transaction not found' });
            }

            if (customerId) transaction.customerId = customerId;
            if (paymentMethod) transaction.paymentMethod = paymentMethod;

            if (items && items.length > 0) {
                const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
                const taxRate = transaction.taxRate;
                const totalWithTax = totalAmount + (totalAmount * taxRate);
                transaction.totalAmount = totalAmount;
                transaction.totalWithTax = totalWithTax;
            }

            await transaction.save();

            res.status(200).json({ message: 'Transaction updated successfully', transaction });
        } catch (error) {
            res.status(500).json({ message: 'Error Updating Transaction', error });
        }
    },

    deleteTransaction: async (req, res) => {
        try {
            const transaction = await Transaction.findByPk(req.params.id);
            if (!transaction) {
                return res.status(404).json({ message: 'Transaction Not found' });
            }
            await transaction.destroy();
            console.log('Transaction deleted');
            res.status(200).json({ message: 'Transaction Deleted' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting Transaction', error });
        }
    },

    generateInvoice: async (req, res) => {
        try {
            const { id } = req.params;

            const transaction = await Transaction.findByPk(id, {
                include: [
                    { model: Product, as: 'products' }
                ]
            });

            if (!transaction) {
                return res.status(404).json({ message: 'Transaction not found' });
            }

            const doc = new PDFDocument();
            const filePath = path.join(__dirname, `../invoices/transaction_${id}.pdf`);
            doc.pipe(fs.createWriteStream(filePath));

            doc.fontSize(18).text('Invoice', { align: 'center' });
            doc.moveDown();

            doc.fontSize(14).text(`Transaction ID: ${transaction.id}`);
            doc.text(`Date: ${transaction.createdAt.toDateString()}`);
            doc.text(`Customer ID: ${transaction.customerId}`);
            doc.text(`Payment Method: ${transaction.paymentMethod}`);
            doc.moveDown();

            doc.fontSize(12).text('Items:', { underline: true });
            transaction.products.forEach(product => {
                doc.text(`Product ID: ${product.id}, Quantity: ${product.transaction_items.quantity}, Price: ${product.price}`);
            });
            doc.moveDown();

            doc.text(`Total Amount: ${transaction.totalAmount}`);
            doc.text(`Tax Rate: ${transaction.taxRate}`);
            doc.text(`Total with Tax: ${transaction.totalWithTax}`);

            doc.end();

            res.status(200).json({ message: 'Invoice generated successfully', invoicePath: filePath });
        } catch (error) {
            res.status(500).json({ message: 'Error Generating Invoice', error });
        }
    },

    getWeeklyReportHandler: async (req, res) => {
        try {
            const { year, month, week } = req.params;
    
            // Validating inputs for month and week
            const validMonth = Math.max(1, Math.min(12, parseInt(month, 10)));
            const validWeek = Math.max(1, Math.min(5, parseInt(week, 10))); // Assuming 4-5 weeks in a month
    
            // Get the start and end dates of the given week of the specified month
            const startOfMonth = new Date(year, validMonth - 1, 1);
            const startOfWeek = addWeeks(startOfMonth, validWeek - 1);
            const endOfWeek = addDays(startOfWeek, 6);
    
            // Fetch transactions for the selected week
            const transactions = await Transaction.findAll({
                where: {
                    createdAt: {
                        [Op.between]: [startOfWeek, endOfWeek],
                    },
                },
            });
    
            // Splitting transactions by day within the week
            let dailyData = [];
            for (let i = 0; i < 7; i++) {
                const currentDayStart = addDays(startOfWeek, i);
                const currentDayEnd = endOfDay(currentDayStart);
    
                const dailyTransactions = transactions.filter(transaction => {
                    const createdAt = new Date(transaction.createdAt);
                    return createdAt >= currentDayStart && createdAt <= currentDayEnd;
                });
    
                const totalTransactions = dailyTransactions.length;
                const totalSales = dailyTransactions.reduce((sum, transaction) => sum + parseFloat(transaction.totalAmount), 0);
    
                dailyData.push({
                    day: format(currentDayStart, 'EEEE'),  // Full name of the day (Monday, Tuesday, etc.)
                    date: format(currentDayStart, 'yyyy-MM-dd'),
                    transactions: totalTransactions,
                    totalSales: totalSales.toFixed(2),
                });
            }
    
            // Sending the response
            res.status(200).json({
                year: parseInt(year, 10),
                week: validWeek,
                startDate: format(startOfWeek, 'yyyy-MM-dd'),
                endDate: format(endOfWeek, 'yyyy-MM-dd'),
                dailyData
            });
        } catch (error) {
            console.error('Error fetching weekly sales report:', error);
            res.status(500).json({ message: 'Error fetching weekly sales report', error: error.message });
        }
    },

    getMonthlyReportHandler: async (req, res) => {
        try {
            const { year, month } = req.params;
            const validMonth = Math.max(1, Math.min(12, parseInt(month ,10)));
            const startDate = new Date(year ,validMonth -1, 1);//first day of the month
            const endDate = new Date(year ,validMonth, 0);//last day of the month
            const monthName = format(startDate, 'MMMM');//Getting the name of the Month

            // Getting all transactions within the month
            const transactions = await Transaction.findAll({
                where: {
                    createdAt: {
                        [Op.between]: [startDate, endDate],
                    },
                },
            });

            // Splitting transactions by weeks
            let weeklyData = [];
            let currentWeekStart = startOfWeek(startDate, { weekStartsOn: 1 });
            let currentWeekEnd = endOfWeek(currentWeekStart);

            while (currentWeekStart <= endDate) {
                const weeklyTransactions = transactions.filter(transaction => {
                    const createdAt = new Date(transaction.createdAt);
                    return createdAt >= currentWeekStart && createdAt <= currentWeekEnd;
                });

                const totalTransactions = weeklyTransactions.length;
                const totalSales  = weeklyTransactions.reduce((sum, transaction) => sum + parseFloat(transaction.totalAmount), 0);

                weeklyData.push({
                    week: format(currentWeekStart, 'wo'),//week number
                    transactions: totalTransactions,
                    totalSales: totalSales.toFixed(2), //Ensuring total sales is a number
                });

                // Moving to next week
                currentWeekStart = addWeeks(currentWeekStart, 1);
                currentWeekEnd = endOfWeek(currentWeekStart);
            }

            res.status(200).json({
                month: monthName,
                year: parseInt(year, 10),
                weeklyData
            });
        } catch (error) {
            console.error('Error fetching monthly sales report:', error);
            res.status(500).json({ message: 'Error fetching monthly sales report', error: error.message });
        }
    },
};

export default transactionController;
