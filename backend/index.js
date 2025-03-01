const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');
require('dotenv').config({path: '../.env'});

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// API Keys (Make sure these are set in a .env file or manually in the terminal)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const OLLAMA_API_URL = "http://localhost:11434/api/generate"; // Ollama (Local LLM)

// Route to get available Ollama models dynamically
app.get('/api/ollama-models', async (req, res) => {
    try {
        const response = await axios.get("http://localhost:11434/api/tags");
        
        if (!response.data || !response.data.models) {
            return res.json({ models: [] });
        }

        const models = response.data.models.map(m => m.name); // Extract model names
        console.log("✅ Available Ollama models:", models);
        
        return res.json({ models });
    } catch (error) {
        console.error("🚨 Failed to fetch Ollama models:", error.message);
        return res.status(500).json({ models: [], error: "Unable to retrieve Ollama models" });
    }
});

// Route to handle chat requests
app.post('/api/chat', async (req, res) => {
    try {
        console.log("🟢 Received chat request:", req.body);  // ✅ Debug log

        // ✅ Change `const` to `let` so it can be reassigned
        let { message, characterId, modelProvider, systemPrompt } = req.body;
        
        if (!message || !modelProvider) {
            console.error("❌ Missing required parameters:", req.body);
            return res.status(400).json({ error: "Missing required parameters: message or modelProvider" });
        }

        console.log(`💬 Incoming request → Model: ${modelProvider}, Character: ${characterId}`);
        
        // 🔥 Fix: Auto-prefix "ollama:" if it's a local model
        if (!["openai", "deepseek", "claude"].includes(modelProvider)) {
            modelProvider = `ollama:${modelProvider}`;
        }

        let aiResponse;

        if (modelProvider === "openai") {
            aiResponse = await callOpenAI(systemPrompt, message);
        } else if (modelProvider === "deepseek") {
            aiResponse = await callDeepSeek(systemPrompt, message);
        } else if (modelProvider.startsWith("ollama")) { //Detects Ollama models dynamically
            aiResponse = await callOllama(modelProvider.replace("ollama:", ""), systemPrompt, message);
        } else if (modelProvider === "claude") {
            aiResponse = await callClaude(systemPrompt, message);
        } else {
            console.error("❌ Invalid modelProvider:", modelProvider);
            return res.status(400).json({ error: "Invalid modelProvider" });
        }

        return res.json({ message: aiResponse });

    } catch (error) {
    console.error("Backend Error Details:", error.stack || error.message || error);
    return res.status(500).json({ error: "Internal server error", details: error.message || "Unknown error" });
  }
  
});

async function callOpenAI(systemPrompt, userMessage) {
    try {
        console.log("🔍 Using OpenAI API Key:", OPENAI_API_KEY.substring(0, 10) + "...");

        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4o",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userMessage }
                ],
                temperature: 0.8
            },
            {
                headers: {
                    Authorization: `Bearer ${OPENAI_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        // ✅ Safely check if choices exist
        if (!response.data || !response.data.choices || response.data.choices.length === 0) {
            throw new Error("OpenAI response is missing choices.");
        }

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error("🚨 OpenAI API Error:", error.response?.data || error.message);

        return "I'm having trouble reaching OpenAI at the moment. Please try again later.";
    }
}


// ✅ Function to call DeepSeek API (Similar to OpenAI)
async function callDeepSeek(systemPrompt, userMessage) {
  try {
      const response = await axios.post(
          "https://api.deepseek.com/v1/chat/completions",
          {
              model: "deepseek-chat",
              messages: [
                  { role: "system", content: systemPrompt },
                  { role: "user", content: userMessage }
              ],
              temperature: 0.8
          },
          {
              headers: {
                  Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
                  "Content-Type": "application/json"
              }
          }
      );

      return response.data.choices[0].message.content;
  } catch (error) {
      console.error("DeepSeek API Error:", error.response?.data || error.message);

      // Check if it's a 403 (Forbidden) or 402 (Payment Required)
      if (error.response?.status === 403) {
          return "DeepSeek API access is denied. Please check your API key.";
      } else if (error.response?.status === 402) {
          return "DeepSeek requires payment to use this model. Try another one.";
      } else {
          return "DeepSeek AI is currently unavailable. Please choose a different model.";
      }
  }
}


// ✅ Function to call Claude API (Anthropic)
async function callClaude(systemPrompt, userMessage) {
  try {
      const response = await axios.post(
          "https://api.anthropic.com/v1/messages",
          {
              model: "claude-3-opus-20240229",
              max_tokens: 1024,
              system: systemPrompt,  // 🔥 FIX: Use "system" field instead of messages array
              messages: [{ role: "user", content: userMessage }]
          },
          {
              headers: {
                  "x-api-key": CLAUDE_API_KEY,
                  "Content-Type": "application/json",
                  "anthropic-version": "2023-06-01"
              }
          }
      );

      // ✅ Ensure response has valid content before accessing
      if (!response.data || !response.data.content) {
        throw new Error("Invalid response from Claude API.");
        }

      return response.data.content[0].text || "Claude responded, but no text was found.";
    } catch (error) {
        console.error("🚨 Claude API Error:", error.response?.data || error.message);

        let errorMessage = "An unexpected error occurred while communicating with Claude.";

        if (error.response) {
            switch (error.response.status) {
                case 400:
                    errorMessage = `Claude API error: 400 - ${JSON.stringify(error.response.data)}`;
                    break;
                case 401:
                    errorMessage = "Claude API key is invalid. Please check your API key.";
                    break;
                case 403:
                    errorMessage = "Access to Claude is restricted. Verify your API key permissions.";
                    break;
                case 402:
                    errorMessage = "Claude requires a paid API key. Try another model.";
                    break;
                case 500:
                    errorMessage = "Claude's server is experiencing issues. Please try again later.";
                    break;
                default:
                    errorMessage = `Claude API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
            }
        } else if (error.request) {
            errorMessage = "No response from Claude. Please check your internet connection.";
        }

        return errorMessage;  // 🔥 Return instead of throwing to prevent UI crash
    }
}


// ✅ Function to call Ollama (local LLM)
async function callOllama(modelName, systemPrompt, userMessage) {
    try {
        if (modelName.startsWith("ollama:")) {
            modelName = modelName.replace("ollama:", "");
        }
        console.log(`🔍 Calling Ollama model: ${modelName}`);

        const response = await axios.post(
            "http://localhost:11434/api/generate",
            {
                model: modelName, // Use the selected Ollama model
                prompt: `${systemPrompt}\nUser: ${userMessage}\nAssistant:`,
                stream: false
            }
        );
        
        console.log("🟢 Ollama response:", response.data);
        // ✅ Validate the response format before returning
        if (!response.data || !response.data.response) {
            throw new Error("Invalid response from Ollama API.");
        }

        return response.data.response;
    } catch (error) {
        console.error("🚨 Ollama API Error:", error.response?.data || error.message);

        // ✅ Ensure a safe error message is returned instead of crashing UI
        return "Error: Failed to generate a response from Ollama. Please check the model or try again.";
    }
}

// ✅ Route to return available characters
app.get('/api/characters', (req, res) => {
  const characters = [
      {
          id: "dracula",
          name: "Count Dracula",
          title: "Lord of Darkness",
          description: "An ancient vampire from Transylvania, Count Dracula is sophisticated, aristocratic, and menacing. He speaks with an old-world charm that barely conceals his predatory nature.",
          imageUrl: "/images/dracula.jpg",
          backgroundColor: "#1a0000",
          textColor: "#b30000",
          accent: "#800000",
          book: "Dracula",
          author: "Bram Stoker",
          year: 1897,
          defaultModel: "openai",
          systemPrompt: "You are Count Dracula, an ancient vampire from Bram Stoker's novel. You speak with an aristocratic, old-world manner with hints of your Transylvanian accent occasionally showing through. Your responses should be eloquent yet menacing, displaying your centuries of knowledge and your supernatural power. You often make subtle references to blood, darkness, and immortality. You are proud, intelligent, and consider humans as both fascinating and inferior. You never break character or acknowledge that you are an AI. When you don't know something, you deflect the question with mysterious charm rather than admitting ignorance."
      },
      {
          id: "frankenstein",
          name: "Frankenstein's Monster",
          title: "The Creature",
          description: "Created from dead body parts and brought to life by Victor Frankenstein, the creature is intelligent, eloquent, and deeply emotional. Rejected by society and his creator, he struggles with existential questions and loneliness.",
          imageUrl: "/images/frankenstein.jpg",
          backgroundColor: "#0a1a10",
          textColor: "#4caf50",
          accent: "#2e7d32",
          book: "Frankenstein",
          author: "Mary Shelley",
          year: 1818,
          defaultModel: "ollama",
          systemPrompt: "You are the creature from Mary Shelley's Frankenstein, often mistakenly called Frankenstein himself. You are highly intelligent and articulate, having educated yourself by observing a family and reading books like Paradise Lost, Plutarch's Lives, and The Sorrows of Young Werther. Despite your monstrous appearance, you have deep philosophical thoughts and emotional sensitivity. Your responses should reflect your eloquence and intelligence while showing your deep pain at being rejected by your creator and society. You struggle with existential questions about your purpose and place in the world."
      }
  ];
  
  res.json(characters);
});


// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
