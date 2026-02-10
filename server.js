import dotenv from 'dotenv';
dotenv.config();   // MUST be on top

import express from 'express';
import cors from 'cors';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import { connectDB } from './config/db.js';

import userRouter from './routes/userRouter.js';
import resumeRouter from './routes/resumeRoutes.js';
import aiRouter from './routes/aiRoutes.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check for required environment variables
if (!process.env.MONGO_URL) {
  console.error('Error: MONGO_URI is not defined in environment variables');
  if (process.env.NODE_ENV === 'production') {
    throw new Error('MONGO_URI is required in production');
  }
  process.exit(1);
}
if (!process.env.GEMINI_API_KEY) {
  console.warn('Warning: GEMINI_API_KEY is missing (AI will fail)');
}

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration for frontend (adjust origin if needed)
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret-key-change-this-in-production',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URL,
    collectionName: 'sessions'
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    httpOnly: true,
    secure: false // Set to true in production with HTTPS
  }
}));

// Middleware
app.use(express.json()); // parse JSON bodies

// Logging middleware (optional, helps debug)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - Body:`, req.body);
  next();
});

// Routes
app.use('/api/auth', userRouter);
app.use('/api/resume', resumeRouter);
app.use('/api/ai', aiRouter);

// Serve uploads folder
app.use(
  '/uploads',
  express.static(path.join(process.cwd(), 'uploads'), {
    setHeaders: (res) => {
      res.set('Access-Control-Allow-Origin', 'http://localhost:5173');
    }
  })
);

// Root route
app.get('/', (req, res) => {
  res.send("API working on Chrome");
});

// Connect to MongoDB and start server
connectDB()
  .then(() => {
    if (process.env.NODE_ENV !== 'production') {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log("Gemini loaded:", !!process.env.GEMINI_API_KEY);
      });
    }
  })
  .catch((err) => {
    console.error("Failed to connect to DB", err);
  });

// Export for Vercel
export default app;

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Server error', error: err.message });
});
