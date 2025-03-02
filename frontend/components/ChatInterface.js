import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import styles from '../styles/Home.module.css';

const ChatInterface = ({ character, onBack, user }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modelProvider, setModelProvider] = useState(character.defaultModel || 'ollama');
  const [ollamaModels, setOllamaModels] = useState([]); //Store available ollama models
  const messagesEndRef = useRef(null);
  
  // Fetch available Ollama models on component mount
  useEffect(() => {
    const fetchOllamaModels = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/ollama-models');
        setOllamaModels(response.data.models || []);
      } catch (error) {
        console.error("Error fetching Ollama models:", error);
      }
    };

    fetchOllamaModels();
  }, []);

  // Add initial welcome message on component mount
  useEffect(() => {
    if (!character || !character.id) return;
  
    const welcomeMessage = {
      role: 'assistant',
      content: getWelcomeMessage(character),
      timestamp: new Date().toISOString()
    };
  
    setMessages(prevMessages => {
      // Only add welcome message if it's a new character
      if (prevMessages.length === 0 || prevMessages[0].role !== 'assistant') {
        return [welcomeMessage];
      }
      return prevMessages;
    });
  }, [character]);
  
  
  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const getWelcomeMessage = (character) => {
    if (character.id === 'dracula') {
      return "Good evening. I have been waiting for someone to disturb my slumber. What brings you to my castle at this late hour? Perhaps you seek knowledge that only the immortal can provide?";
    } else if (character.id === 'frankenstein') {
      return "Who approaches? Another mortal come to gaze upon the monster? Yet you do not flee... How curious. Have you questions for one such as I, rejected by mankind and my own creator?";
    } else if (character.id === 'wednesday') {
      return "You’re here. How unfortunate... for you. But I suppose if you have made it this far, you might as well stay. Just do not expect pleasantries. I find them exhausting.";
    } else {
      return `Welcome, I am ${character.name}. How may I assist you tonight?`;
    }
  };
  
  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return; // Prevent duplicate sends

    const currentMessage = input; // Preserve message before clearing input
    setMessages(prev => [...prev, { role: 'user', content: currentMessage, timestamp: new Date().toISOString() }]);
    setInput('');
    setIsLoading(true);

    let selectedModel = modelProvider;
    
    // 🔥 Fix: Ensure local models are prefixed with "ollama:"
    if (!["openai", "deepseek", "claude"].includes(selectedModel)) {
        selectedModel = `ollama:${selectedModel}`;
    }
    
    console.log("🟢 Sending message with model:", selectedModel);  // ✅ Debug log

    try {
        const response = await axios.post('http://localhost:5000/api/chat', {
            message: currentMessage,
            characterId: character.id,
            modelProvider: selectedModel,  // ✅ Use corrected model name
            systemPrompt: character.systemPrompt
        });

        // ✅ Ensure response and response.data exist before accessing them
        if (!response || !response.data || !response.data.message) {
            throw new Error("Invalid response from AI API.");
        }

        const aiMessage = {
            role: 'assistant',
            content: response.data?.message || "Hmm... It seems something went wrong. Try again?",
            timestamp: new Date().toISOString(),
            isError: !response.data?.message
        };
        setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
        console.error("Error sending message:", error);

        // ✅ Handle DeepSeek API-specific errors
        let errorMessage = "I apologize, but something went wrong.";
        if (error.response) {
            if (error.response.status === 500) {
                errorMessage = "DeepSeek API is unavailable or requires payment. Try a different model.";
            } else if (error.response.status === 403) {
                errorMessage = "Access denied to DeepSeek. Check API settings.";
            } else {
                errorMessage = `Server Error: ${error.response.status} - ${error.response.data?.error || "Unknown error"}`;
            }
        } else if (error.request) {
            errorMessage = "No response from the AI model. Please check your connection.";
        }

        setMessages(prev => [...prev, { role: 'assistant', content: errorMessage, timestamp: new Date().toISOString(), isError: true }]);
    } finally {
        setIsLoading(false); // ✅ Ensure UI doesn't get stuck in loading state
    }
  };


  
  
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  // Generate AL Model Dropdown Options
  const getAIModelOptions = () => {
    return (
      <select 
        value={modelProvider}
        onChange={(e) => setModelProvider(e.target.value)}
        className={styles.modelSelector}
      >
        <option value="openai">OpenAI</option>
        <option value="claude">Claude</option>
        <option value="deepseek">DeepSeek</option>

        {/* Dynamically List Ollama Models */}
        {ollamaModels.map((model) => (
          <option key={model} value={model}>
            Local: {model}
          </option>
        ))}
      </select>
    );
  };
  
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
          {getAIModelOptions()}
        </div>
      </div>
      
      <div className={styles.messagesContainer}>
        {messages.map((msg, index) => (
          <div 
            key={index}
            className={`${styles.message} ${
              msg.role === 'user' ? styles.userMessage : styles.aiMessage
            } ${msg.isError ? styles.errorMessage : ''}`}
            style={
              msg.role === 'assistant' 
                ? { borderColor: character.accent || '#444' }
                : {}
            }
          >
            <div className={styles.messageContent}>{msg.content}</div>
            <div className={styles.messageTime}>
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div 
            className={`${styles.message} ${styles.aiMessage} ${styles.loadingMessage}`}
            style={{ borderColor: character.accent || '#444' }}
          >
            <div className={styles.typingIndicator}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className={styles.inputContainer}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          className={styles.chatInput}
          disabled={isLoading}
        />
        <button 
          onClick={handleSendMessage}
          disabled={isLoading || !input.trim()}
          className={styles.sendButton}
          style={{ 
            backgroundColor: character.accent || '#444',
            color: character.backgroundColor || '#1a1a1a'
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;