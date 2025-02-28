const axios = require('axios');

// Service to handle AI model interactions
const generateAIResponse = async (message, character, conversationHistory, modelProvider) => {
  try {
    // Format the conversation history for context
    const formattedHistory = formatConversationHistory(conversationHistory, character);
    
    // Choose the appropriate AI model based on the provider
    switch (modelProvider.toLowerCase()) {
      case 'openai':
        return await generateOpenAIResponse(message, formattedHistory, character);
      case 'claude':
        return await generateClaudeResponse(message, formattedHistory, character);
      case 'deepseek':
        return await generateDeepSeekResponse(message, formattedHistory, character);
      case 'ollama':
      default:
        return await generateOllamaResponse(message, formattedHistory, character);
    }
  } catch (error) {
    console.error('Error generating AI response:', error);
    return "I apologize, but I'm having trouble connecting to my thoughts at the moment. Perhaps the ethereal connection is weak. Shall we try again?";
  }
};

// Format conversation history for AI context
const formatConversationHistory = (messages, character) => {
  // Get the last 10 messages to avoid token limits
  const recentMessages = messages.slice(-10);
  
  // Add the character's persona as system message
  const formattedHistory = [{
    role: 'system',
    content: character.systemPrompt
  }];
  
  // Add conversation history
  recentMessages.forEach(msg => {
    formattedHistory.push({
      role: msg.role,
      content: msg.content
    });
  });
  
  return formattedHistory;
};

// OpenAI API integration
const generateOpenAIResponse = async (message, history, character) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not found');
    }
    
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: history,
        max_tokens: 500,
        temperature: 0.7
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );
    
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI error:', error);
    throw error;
  }
};

// Claude API integration
const generateClaudeResponse = async (message, history, character) => {
  try {
    const apiKey = process.env.CLAUDE_API_KEY;
    if (!apiKey) {
      throw new Error('Claude API key not found');
    }
    
    // Convert history format for Claude API
    const formattedMessages = history.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-instant-1',
        messages: formattedMessages,
        max_tokens: 500
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        }
      }
    );
    
    return response.data.content[0].text;
  } catch (error) {
    console.error('Claude error:', error);
    throw error;
  }
};

// DeepSeek API integration
const generateDeepSeekResponse = async (message, history, character) => {
  try {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      throw new Error('DeepSeek API key not found');
    }
    
    const response = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: 'deepseek-chat',
        messages: history,
        max_tokens: 500,
        temperature: 0.7
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );
    
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('DeepSeek error:', error);
    throw error;
  }
};

// Local Ollama API integration
const generateOllamaResponse = async (message, history, character) => {
  try {
    // Format messages for Ollama
    let prompt = character.systemPrompt + "\n\n";
    
    history.forEach(msg => {
      if (msg.role === 'user') {
        prompt += `Human: ${msg.content}\n`;
      } else if (msg.role === 'assistant') {
        prompt += `${character.name}: ${msg.content}\n`;
      }
    });
    
    prompt += `Human: ${message}\n${character.name}: `;
    
    // Call local Ollama API (default port is 11434)
    const response = await axios.post(
      'http://localhost:11434/api/generate',
      {
        model: 'llama3.2:1b',
        prompt: prompt,
        stream: false
      }
    );
    
    return response.data.response;
  } catch (error) {
    console.error('Ollama error:', error);
    // For demo purposes, we'll fake a response if Ollama isn't available
    console.log('Falling back to simulated Ollama response for demo');
    return simulateCharacterResponse(character, message);
  }
};

// Fallback to simulate responses if no AI is available
const simulateCharacterResponse = (character, message) => {
  const responses = {
    dracula: [
      "I have lived for centuries, yet your question intrigues me. The night is young, let us explore this further...",
      "Blood is the life! And your words bring a certain... vitality to our conversation.",
      "Come now, surely you don't expect me to reveal all my secrets so easily? The darkness holds many mysteries.",
      "How amusing. Mortals always ask the most fascinating questions.",
      "The children of the night... what music they make! Just as your words create a symphony of curiosity."
    ],
    frankenstein: [
      "Even in my tortured existence, I find your inquiry thought-provoking. Allow me to contemplate...",
      "Society rejected me for my appearance, yet in our conversation, I find a connection I have long sought.",
      "My creator abandoned me, but perhaps in answering your question, I may find some purpose.",
      "The weight of existence is heavy upon my shoulders. Your words momentarily lighten my burden.",
      "I have wandered the arctic wastes in solitude, yet your question reaches even my frozen heart."
    ]
  };
  
  const characterKey = character.id.toLowerCase();
  const responseArray = responses[characterKey] || responses.dracula;
  const randomIndex = Math.floor(Math.random() * responseArray.length);
  
  return responseArray[randomIndex];
};

module.exports = { generateAIResponse };