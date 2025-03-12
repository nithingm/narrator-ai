import axios from 'axios';
import { ICharacter } from '../models/Character';

export const generateAIResponse = async (
  message: string,
  character: ICharacter,
  conversationHistory: any[],
  modelProvider: string
): Promise<string> => {
  try {
    const formattedHistory = formatConversationHistory(conversationHistory, character);
    switch (modelProvider.toLowerCase()) {
      case 'openai':
        return await generateOpenAIResponse(message, formattedHistory, character);
      case 'claude':
        // Claude integration disabled for now.
        return "Claude model is currently unavailable.";
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

const formatConversationHistory = (messages: any[], character: ICharacter): any[] => {
  const recentMessages = messages.slice(-10);
  const formattedHistory = [{
    role: 'system',
    content: character.systemPrompt,
  }];
  recentMessages.forEach(msg => {
    formattedHistory.push({
      role: msg.role,
      content: msg.content,
    });
  });
  return formattedHistory;
};

const generateOpenAIResponse = async (
  message: string,
  history: any[],
  character: ICharacter
): Promise<string> => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key not found');
  }
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-4o-mini',
      messages: history,
      max_tokens: 500,
      temperature: 0.7,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
    }
  );
  return response.data.choices[0].message.content;
};

const generateDeepSeekResponse = async (
  message: string,
  history: any[],
  character: ICharacter
): Promise<string> => {
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
      temperature: 0.7,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
    }
  );
  return response.data.choices[0].message.content;
};

const generateOllamaResponse = async (
  message: string,
  history: any[],
  character: ICharacter
): Promise<string> => {
  let prompt = `${character.systemPrompt}\n\n`;
  history.forEach(msg => {
    if (msg.role === 'user') {
      prompt += `Human: ${msg.content}\n`;
    } else if (msg.role === 'assistant') {
      prompt += `${character.name}: ${msg.content}\n`;
    }
  });
  prompt += `Human: ${message}\n${character.name}: `;
  
  try {
    const response = await axios.post(
      `${process.env.OLLAMA_API_URL}/api/generate`,
      {
        model: 'llama3.2:1b',
        prompt: prompt,
        stream: false,
      }
    );
    return response.data.response;
  } catch (error) {
    console.error('Ollama error:', error);
    return "I apologize, but I'm having trouble connecting to my thoughts at the moment. Perhaps the ethereal connection is weak. Shall we try again?";
  }
};

export const checkOllamaAvailability = async (): Promise<string> => {
  try {
    const response = await axios.get(`${process.env.OLLAMA_API_URL}/api/tags`);
    return response.data ? "available" : "unavailable";
  } catch (error) {
    return "unavailable";
  }
};

export const fetchOllamaModels = async (): Promise<any[]> => {
  try {
    const response = await axios.get(`${process.env.OLLAMA_API_URL}/api/tags`);
    return response.data.models || [];
  } catch (error) {
    console.error("Error fetching Ollama models:", error);
    return [];
  }
};
