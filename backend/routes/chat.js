const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { authenticateToken } = require('../middleware/auth');
const { generateAIResponse } = require('../services/aiService');

// Create a new message in a conversation
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { message, characterId, modelProvider } = req.body;
    const userId = req.user.id;
    
    // Get character details to provide context to the AI
    const characterPath = path.join(__dirname, `../../data/characters/${characterId}.json`);
    const characterData = await fs.readFile(characterPath, 'utf8');
    const character = JSON.parse(characterData);
    
    // Get or create conversation history
    const conversationId = `${userId}-${characterId}`;
    const conversationDir = path.join(__dirname, '../../data/conversations');
    const conversationPath = path.join(conversationDir, `${conversationId}.json`);
    
    let conversation;
    try {
      const conversationData = await fs.readFile(conversationPath, 'utf8');
      conversation = JSON.parse(conversationData);
    } catch (error) {
      // Create new conversation if it doesn't exist
      conversation = { 
        userId, 
        characterId, 
        messages: [] 
      };
    }
    
    // Add user message to conversation
    conversation.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    });
    
    // Generate AI response
    const aiResponse = await generateAIResponse(
      message, 
      character, 
      conversation.messages, 
      modelProvider || 'ollama' // Default to local Ollama if no provider specified
    );
    
    // Add AI response to conversation
    conversation.messages.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString()
    });
    
    // Save updated conversation
    await fs.mkdir(conversationDir, { recursive: true });
    await fs.writeFile(conversationPath, JSON.stringify(conversation, null, 2));
    
    res.json({ 
      message: aiResponse,
      conversation: conversation.messages 
    });
  } catch (error) {
    console.error('Error in chat:', error);
    res.status(500).json({ message: 'Failed to process chat message' });
  }
});

// Get conversation history
router.get('/:characterId', authenticateToken, async (req, res) => {
  try {
    const { characterId } = req.params;
    const userId = req.user.id;
    const conversationId = `${userId}-${characterId}`;
    const conversationPath = path.join(__dirname, `../../data/conversations/${conversationId}.json`);
    
    try {
      const conversationData = await fs.readFile(conversationPath, 'utf8');
      const conversation = JSON.parse(conversationData);
      res.json(conversation.messages);
    } catch (error) {
      // Return empty conversation if it doesn't exist yet
      res.json([]);
    }
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ message: 'Failed to fetch conversation' });
  }
});

module.exports = router;