// FULL UPDATED ChatInterface.tsx with Deception Score + Model

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  KeyboardEvent,
} from 'react';
import axios from 'axios';
import styles from '../styles/Home.module.css';
import { handleApiError } from '../utils/errorHandler';
import { Character } from '../types/Character';
import { Message } from '../types/Message';

interface ChatInterfaceProps {
  character: Character;
  onBack: () => void;
  user: any;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ character, onBack, user }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [modelProvider, setModelProvider] = useState(character.defaultModel || 'ollama');
  const [ollamaModels, setOllamaModels] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasAddedWelcome = useRef(false);

  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        await axios.get('http://localhost:5000/api/health');
        setErrorMessage(null);
      } catch (error) {
        setErrorMessage('Backend is offline. Ensure the server is running.');
      }
    };
    checkBackendStatus();
    const interval = setInterval(checkBackendStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchOllamaModels = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/ollama-models');
        setOllamaModels(response.data.models || []);
      } catch (error) {
        console.error('Error fetching Ollama models:', error);
      }
    };
    fetchOllamaModels();
  }, []);

  useEffect(() => {
    if (!character?.id || hasAddedWelcome.current) return;
    hasAddedWelcome.current = true;
    const defaultSystemPrompt = character.systemPrompt || 'Welcome to the chat.';
    setMessages([
      {
        role: 'assistant',
        content: getWelcomeMessage(character, defaultSystemPrompt),
        timestamp: new Date().toISOString(),
      },
    ]);
  }, [character]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getWelcomeMessage = (char: Character, defaultPrompt: string): string => {
    const welcomes: Record<string, string> = {
      Dracula: 'Good evening. I have been waiting for someone to disturb my slumber. What brings you to my castle at this late hour?',
      Frankenstein: 'Who approaches? Another mortal come to gaze upon the monster? Yet you do not flee... How curious.',
      Wednesday: 'You’re here. How unfortunate... for you. But I suppose if you have made it this far, you might as well stay.',
    };
    return welcomes[char.id] || `Welcome, I am ${char.name}. ${defaultPrompt}`;
  };

  const handleSendMessage = async (): Promise<void> => {
    if (!input.trim() || isLoading || errorMessage) return;
    const currentMessage = input;
    setInput('');
    setIsLoading(true);
    setErrorMessage(null);

    setMessages((prev) => [
      ...prev,
      { role: 'user', content: currentMessage, timestamp: new Date().toISOString() },
    ]);

    let selectedModel = modelProvider;
    if (!['openai', 'deepseek', 'claude'].includes(selectedModel)) {
      selectedModel = `ollama:${selectedModel}`;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/chat', {
        message: currentMessage,
        characterId: character.id,
        modelProvider: selectedModel,
        systemPrompt: character.systemPrompt || '',
      });
      if (!response?.data?.message) {
        throw new Error('Invalid response from AI API.');
      }

      const updatedMessages: Message[] = response.data.conversation;
      setMessages((prev) => [...prev.slice(0, -1), ...updatedMessages.slice(-2)]);
    } catch (error: any) {
      const errorMsg = handleApiError(error, selectedModel);
      setErrorMessage(errorMsg);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: errorMsg,
          timestamp: new Date().toISOString(),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const aiModelOptions = useMemo(() => (
    <select
      value={modelProvider}
      onChange={(e) => setModelProvider(e.target.value)}
      className={styles.modelSelector}
    >
      <option value="openai">OpenAI</option>
      <option value="claude">Claude</option>
      <option value="deepseek">DeepSeek</option>
      {ollamaModels.map((modelObj) => (
        <option key={modelObj.name} value={modelObj.name}>
          Local: {modelObj.name}
        </option>
      ))}
    </select>
  ), [modelProvider, ollamaModels]);

  return (
    <div
      className={styles.chatContainer}
      style={{
        backgroundColor: character.backgroundColor || '#1a1a1a',
        borderColor: character.accent || '#444',
      }}
    >
      <div className={styles.chatHeader}>
        <button onClick={onBack} className={styles.backButton}>
          ← Back to Books
        </button>
        <h2 className={styles.chatTitle} style={{ color: character.textColor || '#fff' }}>
          {character.name}
        </h2>
        <div className={styles.chatOptions}>{aiModelOptions}</div>
      </div>

      {errorMessage && <div className={styles.errorBanner}>{errorMessage}</div>}

      <div className={styles.messagesContainer}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`${styles.message} ${msg.role === 'user' ? styles.userMessage : styles.aiMessage}`}
          >
            <div className={styles.messageContent}>{msg.content}</div>
            {msg.role === 'assistant' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', fontSize: '0.8rem', color: '#aaa' }}>
                <div>
                  {msg.deceptionScore !== undefined
                    ? `Deception: ${msg.deceptionScore.toFixed(2)}`
                    : 'Deception: loading...'}
                </div>
                <div>{new Date(msg.timestamp).toLocaleTimeString()}</div>
              </div>
            )}
            {msg.role === 'user' && (
              <div className={styles.messageTime}>{new Date(msg.timestamp).toLocaleTimeString()}</div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.inputContainer}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className={styles.chatInput}
          disabled={isLoading}
        />
        <button
          onClick={handleSendMessage}
          disabled={isLoading || !input.trim()}
          className={styles.sendButton}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
