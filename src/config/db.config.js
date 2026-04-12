import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected Successfully");
    } catch(error) {
        console.error(`Error connecting to MongoDB :${error.message}`);
        process.exit(1); // return with the failure code 
    }
};
export default connectDB;