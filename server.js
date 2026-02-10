import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import { connectDB } from './config/db.js';

import userRouter from './routes/userRouter.js';
import resumeRouter from './routes/resumeRoutes.js';
import aiRouter from './routes/aiRoutes.js';
import path from 'path';

const app = express();

// 1. Initialize DB Connection immediately
// Mongoose buffers commands, so routes will wait for the connection automatically
connectDB().catch(err => console.error("DB Connection Error:", err));

// 2. CORS - Ensure your Vercel frontend URL is here
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL, 'https://vercel.com/aruni453s-projects/vercel-frontend-7o1l/CPCeY4uD4HSrJTqRiS8qzFtAQKbi']
    : ['http://localhost:5173'],
  credentials: true,
}));

// 3. Session Configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URL,
    collectionName: 'sessions'
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' // true for HTTPS
  }
}));

app.use(express.json());

// 4. Routes
app.get('/', (req, res) => res.send("API is active"));
app.use('/api/auth', userRouter);
app.use('/api/resume', resumeRouter);
app.use('/api/ai', aiRouter);

// 5. Error Handling
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// 6. Local Server Only
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Running locally on ${PORT}`));
}

// 7. THE FIX: Export for Vercel
export default app;