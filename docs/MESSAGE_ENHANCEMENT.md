# Message Enhancement Feature

This document explains the message enhancement feature that uses fal.ai to improve user messages automatically.

## 🎯 Overview

The message enhancement feature allows users to improve their messages using AI-powered text enhancement. It can fix grammar, improve clarity, make messages more professional, creative, or concise based on the user's needs.

## 🚀 Features

### **Enhancement Types:**
- **Grammar** - Fix grammatical errors and improve sentence structure
- **Clarity** - Make messages clearer and easier to understand
- **Professional** - Make messages more professional and business-appropriate
- **Creative** - Make messages more engaging and creative
- **Concise** - Make messages more concise and to the point

### **Target Audiences:**
- **General** - Clear, accessible language for anyone
- **Professional** - Professional terminology for business communication
- **Academic** - Precise, scholarly language with academic tone
- **Casual** - Friendly, conversational language

## 🔧 API Endpoints

### 1. Enhance a Message

**POST** `/api/messages/enhance`

Enhance a message without saving it to the database.

**Request Body:**
```json
{
  "originalMessage": "hey can u help me with this thing its really confusing",
  "enhancementType": "grammar",
  "targetAudience": "professional"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "originalMessage": "hey can u help me with this thing its really confusing",
    "enhancedMessage": "Hello, could you please help me with this matter? I find it quite confusing and would appreciate your assistance.",
    "enhancementType": "grammar",
    "improvements": [
      "Fixed grammatical errors and improved sentence structure",
      "Enhanced clarity and readability"
    ],
    "confidence": 85
  }
}
```

### 2. Create Enhanced Message

**POST** `/api/messages/enhanced`

Create a message with automatic enhancement and save it to the database.

**Request Body:**
```json
{
  "content": "hey can u help me with this thing its really confusing",
  "enhancementType": "grammar",
  "targetAudience": "professional",
  "autoEnhance": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "content": "Hello, could you please help me with this matter? I find it quite confusing and would appreciate your assistance.",
    "author": "0x1234...",
    "created_at": "2024-01-01T12:00:00Z",
    "original_content": "hey can u help me with this thing its really confusing",
    "enhancement_data": "{\"originalMessage\":\"...\",\"enhancedMessage\":\"...\",\"improvements\":[...],\"confidence\":85}",
    "enhancement": {
      "originalMessage": "hey can u help me with this thing its really confusing",
      "enhancedMessage": "Hello, could you please help me with this matter? I find it quite confusing and would appreciate your assistance.",
      "enhancementType": "grammar",
      "improvements": [
        "Fixed grammatical errors and improved sentence structure",
        "Enhanced clarity and readability"
      ],
      "confidence": 85
    }
  }
}
```

### 3. Get Enhancement Options

**GET** `/api/messages/enhancement-options`

Get available enhancement types and target audiences.

**Response:**
```json
{
  "success": true,
  "data": {
    "enhancementTypes": ["grammar", "clarity", "professional", "creative", "concise"],
    "targetAudiences": ["general", "professional", "academic", "casual"],
    "descriptions": {
      "enhancementTypes": {
        "grammar": "Fix grammatical errors and improve sentence structure",
        "clarity": "Make the message clearer and easier to understand",
        "professional": "Make the message more professional and business-appropriate",
        "creative": "Make the message more engaging and creative",
        "concise": "Make the message more concise and to the point"
      },
      "targetAudiences": {
        "general": "Clear, accessible language for anyone",
        "professional": "Professional terminology for business communication",
        "academic": "Precise, scholarly language with academic tone",
        "casual": "Friendly, conversational language"
      }
    }
  }
}
```

## 💻 Usage Examples

### Frontend Integration

```typescript
// Enhance a message
const enhanceMessage = async (message: string, type: string, audience: string) => {
  const response = await fetch('/api/messages/enhance', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      originalMessage: message,
      enhancementType: type,
      targetAudience: audience
    })
  });

  const data = await response.json();
  return data.data.enhancedMessage;
};

// Create an enhanced message
const createEnhancedMessage = async (content: string) => {
  const response = await fetch('/api/messages/enhanced', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      content,
      enhancementType: 'clarity',
      targetAudience: 'general',
      autoEnhance: true
    })
  });

  const data = await response.json();
  return data.data;
};
```

### React Component Example

```tsx
import React, { useState } from 'react';

const MessageEnhancer: React.FC = () => {
  const [originalMessage, setOriginalMessage] = useState('');
  const [enhancedMessage, setEnhancedMessage] = useState('');
  const [enhancementType, setEnhancementType] = useState('clarity');
  const [targetAudience, setTargetAudience] = useState('general');
  const [loading, setLoading] = useState(false);

  const handleEnhance = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/messages/enhance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          originalMessage,
          enhancementType,
          targetAudience
        })
      });

      const data = await response.json();
      setEnhancedMessage(data.data.enhancedMessage);
    } catch (error) {
      console.error('Enhancement failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="message-enhancer">
      <textarea
        value={originalMessage}
        onChange={(e) => setOriginalMessage(e.target.value)}
        placeholder="Enter your message to enhance..."
        rows={4}
      />
      
      <div className="controls">
        <select
          value={enhancementType}
          onChange={(e) => setEnhancementType(e.target.value)}
        >
          <option value="grammar">Grammar</option>
          <option value="clarity">Clarity</option>
          <option value="professional">Professional</option>
          <option value="creative">Creative</option>
          <option value="concise">Concise</option>
        </select>

        <select
          value={targetAudience}
          onChange={(e) => setTargetAudience(e.target.value)}
        >
          <option value="general">General</option>
          <option value="professional">Professional</option>
          <option value="academic">Academic</option>
          <option value="casual">Casual</option>
        </select>

        <button onClick={handleEnhance} disabled={loading}>
          {loading ? 'Enhancing...' : 'Enhance Message'}
        </button>
      </div>

      {enhancedMessage && (
        <div className="enhanced-message">
          <h3>Enhanced Message:</h3>
          <p>{enhancedMessage}</p>
        </div>
      )}
    </div>
  );
};
```

## 🔒 Authentication

All message enhancement endpoints require:
- **Bearer Token**: Privy authentication token
- **Wallet Connection**: Required for creating/saving messages

## 🧪 Testing

### Manual Testing

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Test the enhancement endpoint:
   ```bash
   curl -X POST http://localhost:3001/api/messages/enhance \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{
       "originalMessage": "hey can u help me with this thing its really confusing",
       "enhancementType": "grammar",
       "targetAudience": "professional"
     }'
   ```

### Automated Testing

Run the test script:
```bash
cd backend
node test-message-enhancement.js
```

## 🛠️ Implementation Details

### Service Layer

The `MessageEnhancementService` handles:
- Creating enhancement prompts based on type and audience
- Calling fal.ai any-llm endpoint
- Parsing and structuring responses
- Calculating confidence scores

### Database Schema

Enhanced messages are stored with:
- `content`: The enhanced message
- `original_content`: The original message (if enhanced)
- `enhancement_data`: JSON string with enhancement details

### Error Handling

- Graceful fallback to original message if enhancement fails
- Comprehensive error logging
- User-friendly error messages

## 🚨 Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Check your FAL_KEY is correct
   - Verify you have credits in your fal.ai account

2. **Enhancement Fails**
   - The system will fallback to the original message
   - Check logs for specific error details

3. **Poor Enhancement Quality**
   - Try different enhancement types
   - Adjust target audience setting
   - Check the confidence score in the response

## 📖 Additional Resources

- [Fal.ai Documentation](https://docs.fal.ai/)
- [Any-LLM Endpoint](https://fal.ai/models/fal-ai/any-llm)
- [Message Enhancement Service Source](../backend/src/services/messageEnhancementService.ts)

---

**Note**: This feature uses your existing fal.ai credits, making it a cost-effective way to improve message quality automatically.
