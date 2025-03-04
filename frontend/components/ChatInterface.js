import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import styles from '../styles/Home.module.css';
import { handleApiError } from '../utils/errorHandler'; // Centralized error handling

const ChatInterface = ({ character, onBack, user }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null); // Store backend error status
  const [modelProvider, setModelProvider] = useState(character.defaultModel || 'ollama');
  const [ollamaModels, setOllamaModels] = useState([]);
  const messagesEndRef = useRef(null);
  const hasAddedWelcome = useRef(false);

  // ✅ Check backend status periodically every 5 seconds
  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        await axios.get('http://localhost:5000/api/health'); // Ensure this endpoint exists in backend
        setErrorMessage(null); // ✅ Clear error if backend is online
      } catch (error) {
        setErrorMessage('Backend is offline. Ensure the server is running.');
      }
    };

    checkBackendStatus(); // Initial check
    const interval = setInterval(checkBackendStatus, 5000); // Poll every 5s

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  // ✅ Fetch available Ollama models on component mount
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

  // ✅ Add initial welcome message only once per session
  useEffect(() => {
    if (!character?.id || hasAddedWelcome.current) return;

    hasAddedWelcome.current = true;
    setMessages([
      { 
        role: 'assistant', 
        content: getWelcomeMessage(character), 
        timestamp: new Date().toISOString() 
      }
    ]);
  }, [character]);

  // ✅ Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // ✅ Define personalized welcome messages
  const getWelcomeMessage = (character) => {
    const messages = {
      Dracula: "Good evening. I have been waiting for someone to disturb my slumber. What brings you to my castle at this late hour?",
      Frankenstein: "Who approaches? Another mortal come to gaze upon the monster? Yet you do not flee... How curious.",
      Wednesday: "You’re here. How unfortunate... for you. But I suppose if you have made it this far, you might as well stay.",
    };
    return messages[character.id] || `Welcome, I am ${character.name}. What is it that you seek?`;
  };

  // ✅ Handle sending a message to AI
  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || errorMessage) return; // Prevent sending if backend is down

    const currentMessage = input;
    setMessages(prev => [...prev, { role: 'user', content: currentMessage, timestamp: new Date().toISOString() }]);
    setInput('');
    setIsLoading(true);
    setErrorMessage(null); // Clear error before new request

    let selectedModel = modelProvider;
    if (!["openai", "deepseek", "claude"].includes(selectedModel)) {
      selectedModel = `ollama:${selectedModel}`;
    }

    console.log("🟢 Sending message with model:", selectedModel);

    try {
      const response = await axios.post('http://localhost:5000/api/chat', {
        message: currentMessage,
        characterId: character.id,
        modelProvider: selectedModel,
        systemPrompt: character.systemPrompt
      });

      if (!response?.data?.message) {
        throw new Error("Invalid response from AI API.");
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.data.message,
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      const errorMsg = handleApiError(error, selectedModel);
      setErrorMessage(errorMsg); // Show backend error
      setMessages(prev => [...prev, { role: 'assistant', content: errorMsg, timestamp: new Date().toISOString(), isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Handle Enter key to send messages
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // ✅ AI Model Dropdown Selection
  const aiModelOptions = useMemo(() => (
    <select 
      value={modelProvider}
      onChange={(e) => setModelProvider(e.target.value)}
      className={styles.modelSelector}
    >
      <option value="openai">OpenAI</option>
      <option value="claude">Claude</option>
      <option value="deepseek">DeepSeek</option>
      {ollamaModels.map((model) => (
        <option key={model} value={model}>Local: {model}</option>
      ))}
    </select>
  ), [modelProvider, ollamaModels]);

  return (
    <div 
      className={styles.chatContainer}
      style={{ 
        backgroundColor: character.backgroundColor || '#1a1a1a',
        borderColor: character.accent || '#444'
      }}
    >
      <div className={styles.chatHeader}>
        <button onClick={onBack} className={styles.backButton}>
          ← Back to Books
        </button>
        <h2 
          className={styles.chatTitle}
          style={{ color: character.textColor || '#fff' }}
        >
          {character.name}
        </h2>
        <div className={styles.chatOptions}>
          {aiModelOptions}
        </div>
      </div>

      {/* ✅ Display Backend Error if Exists */}
      {errorMessage && (
        <div className={styles.errorBanner}>
          {errorMessage}
        </div>
      )}

      <div className={styles.messagesContainer}>
        {messages.map((msg, index) => (
          <div key={index} className={`${styles.message} ${msg.role === 'user' ? styles.userMessage : styles.aiMessage}`}>
            <div className={styles.messageContent}>{msg.content}</div>
            <div className={styles.messageTime}>
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
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
