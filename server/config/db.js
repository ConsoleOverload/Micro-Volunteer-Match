import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/micro_volunteer_match');
    console.log(`[MongoDB] Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB] Initial connection error: ${error.message}`);
    console.log('[MongoDB] Running in fallback mode or waiting for connection...');
  }
};
