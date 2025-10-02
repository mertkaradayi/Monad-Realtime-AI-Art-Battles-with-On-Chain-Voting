# API Documentation

This document describes the REST API endpoints for the Battle Semantic backend server.

## Base URL

```
http://localhost:3001 (development)
https://your-domain.com (production)
```

## Authentication

All API endpoints (except health checks) require authentication using Privy access tokens.

### Authentication Header

```http
Authorization: Bearer <access_token>
```

### Getting Access Tokens

Access tokens are obtained from the frontend using Privy's `getAccessToken()` method after wallet connection.

## Endpoints

### 1. Health Check

**GET** `/health`

Check if the server is running.

**Response:**
```json
{
  "status": "OK",
  "message": "Backend server is running",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**Example:**
```bash
curl http://localhost:3001/health
```

---

### 2. Supabase Connection Test

**GET** `/test-supabase`

Test the connection to Supabase database.

**Response:**
```json
{
  "status": "Supabase client initialized successfully",
  "message": "Connection test completed",
  "supabaseUrl": "Configured"
}
```

**Example:**
```bash
curl http://localhost:3001/test-supabase
```

---

### 3. API Information

**GET** `/api`

Get information about available API endpoints.

**Response:**
```json
{
  "message": "Battle Semantic Backend API",
  "version": "1.0.0",
  "endpoints": [
    "GET /health - Health check",
    "GET /test-supabase - Test Supabase connection",
    "GET /api/messages - Get all messages (🔒 Auth required)",
    "POST /api/messages - Create a new message (🔒 Auth + Wallet required)",
    "PUT /api/messages/:id - Update a message (🔒 Auth + Wallet required)",
    "DELETE /api/messages/:id - Delete a message (🔒 Auth + Wallet required)",
    "GET /api - This endpoint"
  ],
  "authentication": {
    "required": "Bearer token from Privy authentication",
    "wallet_required": "Connected wallet required for write operations"
  }
}
```

**Example:**
```bash
curl http://localhost:3001/api
```

---

## Messages API

### 4. Get All Messages

**GET** `/api/messages`

Retrieve all messages, ordered by creation date (newest first).

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "b9e6b192-d5ff-45bb-a428-72c318444265",
      "content": "Hello, world!",
      "author": "0x1234567890abcdef...",
      "created_at": "2024-01-01T12:00:00.000Z",
      "updated_at": "2024-01-01T12:00:00.000Z"
    }
  ]
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Access token required",
  "message": "Please provide a valid authentication token"
}
```

**Example:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/messages
```

---

### 5. Create a New Message

**POST** `/api/messages`

Create a new message. The author is automatically set to the authenticated user's wallet address.

**Authentication:** Required + Wallet

**Request Body:**
```json
{
  "content": "Your message content here"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "b9e6b192-d5ff-45bb-a428-72c318444265",
    "content": "Your message content here",
    "author": "0x1234567890abcdef...",
    "created_at": "2024-01-01T12:00:00.000Z",
    "updated_at": "2024-01-01T12:00:00.000Z"
  }
}
```

**Error Responses:**
```json
// Missing content
{
  "success": false,
  "error": "Content is required"
}

// Authentication required
{
  "success": false,
  "error": "Access token required",
  "message": "Please provide a valid authentication token"
}

// Wallet required
{
  "success": false,
  "error": "Wallet required",
  "message": "A connected wallet is required for this operation"
}
```

**Example:**
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "Hello from the API!"}' \
  http://localhost:3001/api/messages
```

---

### 6. Update a Message

**PUT** `/api/messages/:id`

Update an existing message by ID.

**Authentication:** Required + Wallet

**URL Parameters:**
- `id` (string): The UUID of the message to update

**Request Body:**
```json
{
  "content": "Updated message content"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "b9e6b192-d5ff-45bb-a428-72c318444265",
    "content": "Updated message content",
    "author": "0x1234567890abcdef...",
    "created_at": "2024-01-01T12:00:00.000Z",
    "updated_at": "2024-01-01T12:05:00.000Z"
  }
}
```

**Error Responses:**
```json
// Message not found
{
  "success": false,
  "error": "Message not found"
}

// Missing content
{
  "success": false,
  "error": "Content is required"
}
```

**Example:**
```bash
curl -X PUT \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "Updated content"}' \
  http://localhost:3001/api/messages/b9e6b192-d5ff-45bb-a428-72c318444265
```

---

### 7. Delete a Message

**DELETE** `/api/messages/:id`

Delete a message by ID.

**Authentication:** Required + Wallet

**URL Parameters:**
- `id` (string): The UUID of the message to delete

**Response:**
```json
{
  "success": true,
  "message": "Message deleted successfully"
}
```

**Error Responses:**
```json
// Message not found
{
  "success": false,
  "error": "Message not found"
}
```

**Example:**
```bash
curl -X DELETE \
  -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/messages/b9e6b192-d5ff-45bb-a428-72c318444265
```

---

## Error Handling

### HTTP Status Codes

- `200` - Success
- `201` - Created (for POST requests)
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (wallet required)
- `404` - Not Found (message doesn't exist)
- `500` - Internal Server Error

### Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error type",
  "message": "Human-readable error description"
}
```

### Common Error Types

- `Access token required` - Missing Authorization header
- `Invalid token` - Invalid or expired access token
- `Wallet required` - Operation requires a connected wallet
- `Content is required` - Missing required content field
- `Message not found` - Message with specified ID doesn't exist
- `Authentication failed` - General authentication error
- `Failed to fetch messages` - Database error when fetching
- `Failed to create message` - Database error when creating
- `Failed to update message` - Database error when updating
- `Failed to delete message` - Database error when deleting

---

## Rate Limiting

Currently, no rate limiting is implemented. For production, consider implementing rate limiting to prevent abuse.

## CORS

CORS is enabled for development. For production, configure CORS to only allow your frontend domain:

```typescript
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-frontend-domain.com'],
  credentials: true
}));
```

## Security Considerations

1. **Authentication Required**: All endpoints require valid Privy access tokens
2. **Wallet Verification**: Write operations require a connected wallet
3. **Input Validation**: All input is validated and sanitized
4. **SQL Injection Protection**: Using parameterized queries via Supabase
5. **CORS Configuration**: Properly configured for production

## Testing the API

### Using curl

```bash
# Get access token from frontend (after wallet connection)
TOKEN="your_access_token_here"

# Test all endpoints
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/messages

curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "Test message"}' \
  http://localhost:3001/api/messages
```

### Using Postman

1. Set base URL to `http://localhost:3001`
2. Add Authorization header: `Bearer YOUR_TOKEN`
3. Set Content-Type to `application/json` for POST/PUT requests
4. Test each endpoint with appropriate methods and data

### Using Frontend

The frontend automatically handles authentication and API calls. Simply connect your wallet and use the UI to test all functionality.

---

For more information about the project setup and configuration, see the other documentation files in the `docs/` directory.
