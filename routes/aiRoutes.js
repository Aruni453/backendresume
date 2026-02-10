import express from 'express';
import { chatWithAI } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/ai/chat - Chat with AI assistant
router.post('/chat', protect, chatWithAI);

export default router;
