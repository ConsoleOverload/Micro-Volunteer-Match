import mongoose from 'mongoose';

let connectionAttempts = 0;
const MAX_RETRIES = 5;

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/micro_volunteer_match';
    
    console.log(`[MongoDB] Attempting connection to cluster...`);
    
    const options = {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority',
      maxPoolSize: 10
    };

    const conn = await mongoose.connect(mongoURI, options);
    connectionAttempts = 0;
    console.log(`✅ [MongoDB] Connected successfully to: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    connectionAttempts++;
    console.error(`❌ [MongoDB] Connection error (Attempt ${connectionAttempts}/${MAX_RETRIES}): ${error.message}`);
    
    if (connectionAttempts < MAX_RETRIES) {
      console.log('[MongoDB] Retrying in 10 seconds...');
      await new Promise(resolve => setTimeout(resolve, 10000));
      return connectDB();
    } else {
      console.error('[MongoDB] Max retries reached. Check your MongoDB Atlas credentials and network.');
      throw error;
    }
  }
};
