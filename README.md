# Narrator AI

A gothic-themed chatbot where users can select a book, choose a character, and chat with them. The app supports multiple AI models including OpenAI, DeepSeek, Claude, and local models via Ollama.

## Setup
1. Install ollama for local model llama3.2:1b
```bash
ollama run llama3.2:1b
```
2. Replace .env file contents with API keys in the project folder to use OpenAI/Claude/Deepseek.
   
## Quick Start

Run the application using the start script:
On terminal, go to the project folder

On Linux/Mac:
```bash
./start.sh
```
On Windows:
```bash
start start.bat
```


This will start both the backend server and the frontend development server.

- On browser, go to http://localhost:3000 to use the app

## Running Manually

### Backend

```bash
cd backend
npm run dev  # Development with auto-reload
# or
npm start    # Production
```

### Frontend

```bash
cd frontend
npm run dev
```

- Backend runs on: http://localhost:5000
- Frontend runs on: http://localhost:3000
  
## Features

- Gothic-themed user interface with customizable styling
- Character selection from classic literature (Dracula, Frankenstein)
- Multi-model support (OpenAI, Claude, DeepSeek, Ollama local models)
- User authentication system
- Persistent conversation memory per character
- Local-first approach to minimize cloud costs

## Demo Mode

The application runs in demo mode by default:
- Mock API responses for characters that don't need external AI APIs
- Simulated login/authentication
- Fallback to demo characters if API fails

## Tech Stack

- **Frontend**: React with Next.js
- **Backend**: Express.js
- **Authentication**: JWT-based
- **AI Integrations**: OpenAI, Claude, DeepSeek, Ollama

## Demo Login

You can log in with any credentials in demo mode - no actual authentication is performed.

## License

MIT
