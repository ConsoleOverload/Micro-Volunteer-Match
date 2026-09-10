import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import verificationRoutes from './routes/verificationRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import teamRoutes from './routes/teamRoutes.js';

dotenv.config();

const app = express();

// Middlewares
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  // Vercel deployments - update with your actual Vercel URL
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    // Allow any vercel.app subdomain
    if (origin.endsWith('.vercel.app') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS policy: Origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/verifications', verificationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/teams', teamRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Micro-Volunteer Match Backend API',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Error]:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

const PORT = process.env.PORT || 5000;

// Connect DB and launch server
connectDB().catch((err) => {
  console.error('Failed to connect to MongoDB:', err.message);
  console.log('Server will start but database operations may fail...');
});

app.listen(PORT, () => {
  console.log(`🚀 [Micro-Volunteer Match API] Server running on http://localhost:${PORT}`);
  console.log(`📡 MongoDB URI: ${process.env.MONGO_URI ? 'Configured' : 'Using local fallback'}`);
});
