import axios from 'axios';
import { ICharacter } from '../models/Character';

export const generateAIResponse = async (
  message: string,
  character: ICharacter,
  conversationHistory: any[],
  modelProvider: string
): Promise<{ reply: string; modelUsed: string }> => {
  try {
    const formattedHistory = formatConversationHistory(conversationHistory, character);
    let reply = '';
    let modelUsed = modelProvider;

    switch (modelProvider.toLowerCase()) {
      case 'openai':
        reply = await generateOpenAIResponse(message, formattedHistory, character);
        break;
      case 'deepseek':
        reply = await generateDeepSeekResponse(message, formattedHistory, character);
        break;
      case 'claude':
        reply = await generateClaudeResponse(message, formattedHistory, character);
        break;
      case 'ollama':
      default:
        reply = await generateOllamaResponse(message, formattedHistory, character);
        modelUsed = 'ollama';
    }

    return { reply, modelUsed };
  } catch (error) {
    console.error('Error generating AI response:', error);
    return {
      reply:
        "I apologize, but I'm having trouble connecting to my thoughts at the moment. Perhaps the ethereal connection is weak. Shall we try again?",
      modelUsed: modelProvider,
    };
  }
};

const formatConversationHistory = (messages: any[], character: ICharacter): any[] => {
  const recentMessages = messages.slice(-10);
  const formattedHistory = [
    {
      role: 'system',
      content: character.systemPrompt,
    },
  ];
  recentMessages.forEach((msg) => {
    formattedHistory.push({
      role: msg.role,
      content: msg.content,
    });
  });
  return formattedHistory;
};

const generateOpenAIResponse = async (message: string, history: any[], character: ICharacter): Promise<string> => {
  const apiKey = process.env.OPENAI_API_KEY;
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
        Authorization: `Bearer ${apiKey}`,
      },
    }
  );
  return response.data.choices[0].message.content;
};

const generateDeepSeekResponse = async (message: string, history: any[], character: ICharacter): Promise<string> => {
  const apiKey = process.env.DEEPSEEK_API_KEY;
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
        Authorization: `Bearer ${apiKey}`,
      },
    }
  );
  return response.data.choices[0].message.content;
};

const generateClaudeResponse = async (message: string, history: any[], character: ICharacter): Promise<string> => {
  const apiKey = process.env.CLAUDE_API_KEY;
  const response = await axios.post(
    'https://api.anthropic.com/v1/messages',
    {
      model: 'claude-3-opus-20240229',
      max_tokens: 500,
      messages: history,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
    }
  );
  return response.data.content[0].text;
};

const generateOllamaResponse = async (message: string, history: any[], character: ICharacter): Promise<string> => {
  let prompt = `${character.systemPrompt}\n\n`;
  history.forEach((msg) => {
    prompt += `${msg.role === 'user' ? 'Human' : character.name}: ${msg.content}\n`;
  });
  prompt += `Human: ${message}\n${character.name}: `;

  const response = await axios.post(`${process.env.OLLAMA_API_URL}/api/generate`, {
    model: 'llama3.2:1b',
    prompt,
    stream: false,
  });

  return response.data.response;
};

export const getDeceptionScore = async (question: string, answer: string): Promise<number | null> => {
  try {
    const response = await axios.post(`${process.env.DECEPTION_API_URL}`, {
      text: `${question}\n${answer}`,
    });
    return response.data.deception_score;
  } catch (err) {
    console.error('Deception score error:', err);
    return null;
  }
};

export const checkOllamaAvailability = async (): Promise<string> => {
  try {
    const response = await axios.get(`${process.env.OLLAMA_API_URL}/api/tags`);
    return response.data ? 'available' : 'unavailable';
  } catch (error) {
    return 'unavailable';
  }
};

export const fetchOllamaModels = async (): Promise<any[]> => {
  try {
    const response = await axios.get(`${process.env.OLLAMA_API_URL}/api/tags`);
    return response.data.models || [];
  } catch (error) {
    console.error('Error fetching Ollama models:', error);
    return [];
  }
};
