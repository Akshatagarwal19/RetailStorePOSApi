import Customer from '../models/customer.model.js'

const customerController = {
    getAllCustomers : async (req, res) => {
        try {
            const customers = await Customer.find();
            res.status(200).json(customers);
        } catch (error) {
            res.status(500).json({ message: err.message });
        }
    },
    
    createCustomer : async (req, res) => {
        const customer = new Customer({
            name: req.body.name,
            phone_number: req.body.phone_number,
            email: req.body.email,
            address: req.body.address,
        });
    
        try {
            const newCustomer = await customer.save();
            res.status(201).json(newCustomer);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    },

    getCustomerById: async (req, res) => {
        try {
            const customer = await Customer.findById(req.params.id);
            if (!customer) return res.status(404).json({ message: "Customer not found" });
            res.status(200).json(customer);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    updateCustomer: async (req, res) => {
        try {
            const customer = await Customer.findById(req.params.id);
            if (customer) {
                customer.name = req.body.name || customer.name;
                customer.phone_number = req.body.phone_number || customer.phone_number;
                customer.email = req.body.email || customer.email;
                customer.address = req.body.address || customer.address;

                const updatedCustomer = await customer.save();
                res.status(200).json(updatedCustomer);
            }else {
                res.status(404).json({ message:'Customer not found'})
            }
        }catch (error) {
            res.status(500).json({ message: 'Error updating customer', error});
        }
    },
    deleteCustomer: async (req, res) => {
        try {
            const customer = await Customer.findByIdAndDelete(req.params.id);
            
            if (!customer) {
                return res.status(404).json({ message: 'Customer not found' });
            }
    
            res.status(200).json({ message: 'Customer deleted successfully' });
        } catch (error) {
            console.error("Error deleting customer:", error);
            res.status(500).json({ message: 'Error deleting customer', error: error.message || 'Internal Server Error' });
        }
    },
};

export default customerController;