import mongoose from "mongoose";
import dotenv from 'dotenv';
import Customer from './src/models/customer.model.js';  // Adjust the path if necessary

dotenv.config();

async function insertMockData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const customers = [
            {
                name: 'John Doe',
                phone_number: '1234567890',
                email: 'johndoe@example.com',
                address: '123 Main St, Anytown, USA',
                purchase_history: [
                    {
                        transaction_id: 'TXN1001',
                        date: new Date('2024-08-01'),
                        amount: 100.50
                    },
                    {
                        transaction_id: 'TXN1002',
                        date: new Date('2024-08-15'),
                        amount: 250.75
                    }
                ]
            },
            {
                name: 'Jane Smith',
                phone_number: '0987654321',
                email: 'janesmith@example.com',
                address: '456 Elm St, Othertown, USA',
                purchase_history: [
                    {
                        transaction_id: 'TXN1003',
                        date: new Date('2024-08-05'),
                        amount: 50.00
                    }
                ]
            },
            {
                name: 'Alice Johnson',
                phone_number: '5678901234',
                email: 'alicej@example.com',
                address: '789 Oak St, Smalltown, USA',
                purchase_history: []
            }
        ];

        await Customer.insertMany(customers);
        console.log('Mock data inserted successfully');
    } catch (error) {
        console.error('Error inserting mock data:', error);
    } finally {
        mongoose.connection.close();
    }
}

insertMockData();
