import mongoose from "mongoose";

// function to connect to MongoDB
export const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("MongoDB connected successfully");
    });
    await mongoose.connect(`${process.env.MONGODB_URI}/वेदसंवाद`);
  } catch (error) {
    console.error("MongoDB connection failed:", error);
  }
};
