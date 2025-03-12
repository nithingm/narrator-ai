import dotenv from 'dotenv';
dotenv.config({ path: '../.env', override: true });
import axios from 'axios';

async function testOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('OpenAI API key not found');
    return;
  }
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: 'Test connection to OpenAI' }],
        max_tokens: 10,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    );
    console.log('OpenAI test successful. Response:', response.data);
  } catch (error) {
    console.error('OpenAI test error:', error);
  }
}

async function testClaude() {
  console.error('Claude model is disabled.');
}

async function testDeepSeek() {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.error('DeepSeek API key not found');
    return;
  }
  try {
    const response = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [{ role: 'system', content: 'Test connection to DeepSeek' }],
        max_tokens: 10,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    );
    console.log('DeepSeek test successful. Response:', response.data);
  } catch (error) {
    console.error('DeepSeek test error:', error);
  }
}

async function testOllama() {
  try {
    const prompt = "System: Test connection to Ollama\nHuman: Hello\nAssistant:";
    const response = await axios.post(
      `${process.env.OLLAMA_API_URL}/api/generate`,
      {
        model: 'llama3.2:1b',
        prompt: prompt,
        stream: false,
      }
    );
    console.log('Ollama test successful. Response:', response.data);
  } catch (error) {
    console.error('Ollama test error:', error);
  }
}

(async function runTests() {
  console.log('Running OpenAI test...');
  await testOpenAI();

  console.log('\nRunning Claude test...');
  await testClaude();

  console.log('\nRunning DeepSeek test...');
  await testDeepSeek();

  console.log('\nRunning Ollama test...');
  await testOllama();
})();
