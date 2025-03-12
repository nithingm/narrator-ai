// backend/routes/chat.ts

import express, { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import Character from '../models/Character';
import Conversation from '../models/Conversation';
import { generateAIResponse } from '../services/aiService';

const router = express.Router();

/**
 * POST /api/chat
 * Creates a new message in a conversation and gets AI response
 */
router.post('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, characterId, modelProvider } = req.body;
    const userId = (req as any).user.id; // Type assertion if user is attached to req

    // Fetch the character for context
    const character = await Character.findOne({ id: characterId });
    if (!character) {
      res.status(404).json({ message: 'Character not found' });
      return; // Exit the function to avoid returning anything else
    }

    // Get or create conversation
    let conversation = await Conversation.findOne({ userId, characterId });
    if (!conversation) {
      conversation = new Conversation({ userId, characterId, messages: [] });
    }

    // Add user's message
    conversation.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date(),
    });

    // Generate AI response
    const aiResponse = await generateAIResponse(
      message,
      character,
      conversation.messages,
      modelProvider || 'ollama'
    );

    // Add AI's response
    conversation.messages.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date(),
    });

    // Save updated conversation
    await conversation.save();

    // Respond with the AI message and updated conversation
    res.json({
      message: aiResponse,
      conversation: conversation.messages,
    });
  } catch (error) {
    console.error('Error in chat:', error);
    res.status(500).json({ message: 'Failed to process chat message' });
  }
});

/**
 * GET /api/chat/:characterId
 * Retrieves the conversation history for a specific character
 */
router.get('/:characterId', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { characterId } = req.params;
    const userId = (req as any).user.id;

    const conversation = await Conversation.findOne({ userId, characterId });
    if (!conversation) {
      // If no conversation yet, return an empty array
      res.json([]);
      return;
    }

    res.json(conversation.messages);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ message: 'Failed to fetch conversation' });
  }
});

export default router;
