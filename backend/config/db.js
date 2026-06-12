import mongoose from "mongoose";

export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return mongoose.connection;

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      bufferCommands: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to the database: ${error.message}`);
  }
};
