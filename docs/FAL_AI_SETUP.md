# Fal.ai Integration Setup

This document explains how to set up and use fal.ai's any-llm endpoint in the Battle Semantic project.

## 🎯 Overview

Fal.ai provides access to multiple large language models through a single API endpoint (`fal-ai/any-llm`). This integration allows you to use various LLMs without needing separate API keys for each provider.

## 🚀 Quick Start

### 1. Get Your Fal.ai API Key

1. Visit [fal.ai](https://fal.ai) and create an account
2. Go to your dashboard and generate an API key
3. Copy your API key

### 2. Set Environment Variable

Add your API key to your environment:

```bash
# In your .env file
FAL_KEY=your_fal_ai_api_key_here
```

### 3. Test the Integration

Run the test script to verify everything is working:

```bash
cd backend
node test-fal-ai.js
```

## 📚 Available Models

The following models are available through the any-llm endpoint:

- `anthropic/claude-3.5-sonnet` - Claude 3.5 Sonnet (recommended for most tasks)
- `anthropic/claude-3-haiku` - Claude 3 Haiku (faster, cheaper)
- `google/gemini-pro-1.5` - Google Gemini Pro 1.5
- `google/gemini-2.5-pro` - Google Gemini 2.5 Pro (latest)
- `meta-llama/llama-3.2-3b-instruct` - Llama 3.2 3B
- `meta-llama/llama-3.2-1b-instruct` - Llama 3.2 1B
- `openai/gpt-4o` - GPT-4o
- `openai/gpt-4o-mini` - GPT-4o Mini
- `openai/gpt-3.5-turbo` - GPT-3.5 Turbo
- `openai/gpt-5-nano` - GPT-5 Nano (latest, efficient)

## 🔧 API Endpoints

### Generate Text

**POST** `/api/llm/generate`

Generate text using any available model.

**Request Body:**
```json
{
  "model": "anthropic/claude-3.5-sonnet",
  "prompt": "Hello, how are you?",
  "temperature": 0.7,
  "max_tokens": 1000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "data": {
      "output": "Hello! I'm doing well, thank you for asking.",
      "reasoning": null,
      "partial": false,
      "error": null
    },
    "requestId": "03110174-cbf0-4048-ac82-4d1cb79caab8"
  }
}
```

### Generate Text with Streaming

**POST** `/api/llm/stream`

Generate text with real-time streaming support.

**Request Body:** Same as generate endpoint

**Response:** Server-Sent Events stream

### Get Available Models

**GET** `/api/llm/models`

Get list of available models.

**Response:**
```json
{
  "success": true,
  "data": {
    "models": [
      "anthropic/claude-3.5-sonnet",
      "anthropic/claude-3-haiku",
      // ... other models
    ],
    "count": 8
  }
}
```

## 💻 Usage Examples

### Frontend Integration

```typescript
// Generate text
const response = await fetch('/api/llm/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    model: 'google/gemini-2.5-pro', // or 'openai/gpt-5-nano'
    prompt: 'Explain quantum computing in simple terms',
    temperature: 0.7,
    max_tokens: 500
  })
});

const data = await response.json();
console.log(data.data.data.output);
```

### Streaming Example

```typescript
// Stream text generation
const response = await fetch('/api/llm/stream', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    model: 'anthropic/claude-3.5-sonnet',
    prompt: 'Write a short story about a robot'
  })
});

const reader = response.body?.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  const lines = chunk.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = line.slice(6);
      if (data === '[DONE]') break;
      
      try {
        const parsed = JSON.parse(data);
        console.log(parsed.data?.output || '');
      } catch (e) {
        // Ignore parsing errors
      }
    }
  }
}
```

## 🔒 Authentication

All LLM endpoints require authentication:

1. **Bearer Token**: Include your Privy authentication token in the Authorization header
2. **Wallet Connection**: Some endpoints may require a connected wallet

## 💰 Cost Management

- Fal.ai uses a credit-based system
- Different models have different costs per token
- Monitor your usage in the fal.ai dashboard
- Consider using cheaper models (like `claude-3-haiku` or `gpt-3.5-turbo`) for simple tasks

## 🛠️ Development

### Service Layer

The `FalService` class in `src/services/falService.ts` handles all fal.ai interactions:

```typescript
import { FalService } from '../services/falService.js';

// Generate text
const response = await FalService.generateText({
  model: 'anthropic/claude-3.5-sonnet',
  messages: [{ role: 'user', content: 'Hello!' }]
});

// Get available models
const models = FalService.getAvailableModels();
```

### Error Handling

The service includes comprehensive error handling:

- Invalid model validation
- Message format validation
- API error handling
- Network error handling

## 🧪 Testing

### Manual Testing

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Test the endpoints using curl or Postman:
   ```bash
   curl -X POST http://localhost:3001/api/llm/generate \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{
       "model": "anthropic/claude-3.5-sonnet",
       "messages": [{"role": "user", "content": "Hello!"}]
     }'
   ```

### Automated Testing

Run the test script:
```bash
cd backend
node test-fal-ai.js
```

## 🚨 Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Check your FAL_KEY is correct
   - Verify you have credits in your fal.ai account

2. **Invalid Model Error**
   - Use one of the supported models from `getAvailableModels()`
   - Check model name spelling

3. **Message Format Error**
   - Ensure messages array is not empty
   - Each message must have `role` and `content` fields
   - Role must be one of: `user`, `assistant`, `system`

4. **Network Errors**
   - Check your internet connection
   - Verify fal.ai service status

### Debug Mode

Enable debug logging by setting:
```bash
DEBUG=fal:*
```

## 📖 Additional Resources

- [Fal.ai Documentation](https://docs.fal.ai/)
- [Any-LLM Endpoint](https://fal.ai/models/fal-ai/any-llm)
- [Available Models](https://fal.ai/models)
- [Pricing Information](https://fal.ai/pricing)

## 🔄 Updates

This integration is designed to be easily extensible. To add new models or features:

1. Update the `getAvailableModels()` method in `FalService`
2. Add new endpoints in `llmController.ts`
3. Update this documentation

---

**Note**: This integration uses your existing fal.ai credits, making it a cost-effective alternative to multiple API subscriptions.
