// backend/index.ts

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';
import axios from 'axios';
import { connectDB } from './config/db';
import authRouter from './routes/auth';
import charactersRouter from './routes/characters';
import chatRouter from './routes/chat';
import { checkOllamaAvailability, fetchOllamaModels } from './services/aiService';

// Load environment variables from .env (located at the project root)
dotenv.config({ path: '../.env', override: true });

// Check for JWT_SECRET in non-development environments
if (!process.env.JWT_SECRET && process.env.NODE_ENV !== 'development') {
  console.error("JWT_SECRET is not set in the environment");
  process.exit(1);
}

const app = express();
const PORT = 5000;

connectDB();

// Middleware
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(bodyParser.json());
app.use(morgan('tiny'));

// Health Check Endpoint
app.get('/api/health', async (req: Request, res: Response): Promise<void> => {
  try {
    const ollamaStatus = await checkOllamaAvailability();
    res.json({
      status: 'ok',
      services: {
        openai: process.env.OPENAI_API_KEY ? 'configured' : 'missing',
        deepseek: process.env.DEEPSEEK_API_KEY ? 'configured' : 'missing',
        claude: 'disabled',
        ollama: ollamaStatus,
      },
    });
    return;
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in /api/health:', errMsg);
    res.status(500).json({ message: 'Health check failed' });
    return;
  }
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/characters', charactersRouter);
app.use('/api/chat', chatRouter);

// Models Endpoint: Returns available AI models (merging OpenAI and local Ollama models)
app.get('/api/models', async (req: Request, res: Response): Promise<void> => {
  try {
    let models: string[] = ['gpt-4o-mini'];
    try {
      const response = await axios.get(`${process.env.OLLAMA_API_URL}/api/tags`);
      if (response.data.models) {
        const ollamaModels = response.data.models.map((m: any) => `ollama:${m.name}`);
        models = [...models, ...ollamaModels];
      }
    } catch (error: unknown) {
      console.warn('Ollama not available. Using only OpenAI model.');
    }
    console.log('Available AI models:', models);
    res.json({ models });
    return;
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to fetch AI models:', errMsg);
    res.status(500).json({ models: ['gpt-4o-mini'], error: 'Defaulting to OpenAI model' });
    return;
  }
});

// Ollama Models Endpoint
app.get('/api/ollama-models', async (req: Request, res: Response): Promise<void> => {
  try {
    const models = await fetchOllamaModels();
    console.log('Fetched Ollama models:', models);
    res.json({ models });
    return;
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching Ollama models:', errMsg);
    res.status(500).json({ error: 'Failed to retrieve Ollama models' });
    return;
  }
});

// Global Request Logger
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  next();
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
