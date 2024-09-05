import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: true,
    },
    phone_number: {
        type: String, 
        required: true,
        unique: true,
    },
    email: {
        type: String,  
        unique: true,
    },
    address: {
        type: String,  
    },
    purchase_history: [{ 
        transaction_id: {
            type: String, 
        }, 
        date: {
            type: Date,  
        }, 
        amount: {
            type: Number,  
        },
    }],
}, { timestamps: true });

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;

