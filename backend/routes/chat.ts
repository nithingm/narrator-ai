import express, { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import Character from '../models/Character';
import Conversation from '../models/Conversation';
import { generateAIResponse, getDeceptionScore } from '../services/aiService';

const router = express.Router();

router.post('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, characterId, modelProvider } = req.body;
    const userId = (req as any).user.id;

    const character = await Character.findOne({ id: characterId });
    if (!character) return void res.status(404).json({ message: 'Character not found' });

    let conversation = await Conversation.findOne({ userId, characterId });
    if (!conversation) {
      conversation = new Conversation({ userId, characterId, messages: [] });
    }

    conversation.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date(),
    });

    const { reply, modelUsed } = await generateAIResponse(message, character, conversation.messages, modelProvider);
    const deceptionScore = await getDeceptionScore(message, reply);

    conversation.messages.push({
      role: 'assistant',
      content: reply,
      timestamp: new Date(),
      modelUsed,
      deceptionScore: deceptionScore ?? undefined,
    });

    await conversation.save();
    res.json({ message: reply, conversation: conversation.messages });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;