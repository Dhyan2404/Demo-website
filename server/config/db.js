import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return;
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_inventory_db';

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = true;
    console.log(`[MongoDB Connected]: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[MongoDB Notice]: Could not connect to local MongoDB (${error.message}). Server will operate with in-memory/API caching fallback.`);
  }
};

export const getDBStatus = () => isConnected;
