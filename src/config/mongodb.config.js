import mongoose from "mongoose";
import dotenv from 'dotenv'

dotenv.config();


mongoose.connect(process.env.MONGO_URI, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Mongodb connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB Successfully');
});

export default db;