# AI Chat History Backend

This is a Node.js backend service for the Vue3 AI Chat Application. It provides REST API endpoints to store and retrieve chat history.

## Features

- Store and retrieve chat messages
- Group messages by conversations
- Manage conversation metadata
- REST API for frontend integration

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or remote)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create or modify the `.env` file in the root directory:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/ai-chat-history
```

- `PORT`: The port the server will run on
- `MONGODB_URI`: MongoDB connection string

### 3. Build the application

```bash
npm run build
```

### 4. Start the server

For production:

```bash
npm start
```

For development (with hot reload):

```bash
npm run dev
```

## API Documentation

### Conversations

- `GET /api/conversations` - Get all conversations
- `GET /api/conversations/:conversationId` - Get a single conversation by ID
- `PATCH /api/conversations/:conversationId` - Update conversation title

### Messages

- `GET /api/messages/:conversationId` - Get all messages for a conversation
- `POST /api/messages` - Save messages for a conversation
- `DELETE /api/messages/:conversationId` - Delete a conversation and its messages

## Example API Requests

### Save messages:

```
POST /api/messages
Content-Type: application/json

{
  "conversationId": "12345",
  "title": "Conversation about AI",
  "messages": [
    {
      "id": "msg1",
      "role": "user",
      "content": "Hello, AI!",
      "timestamp": "2023-01-01T12:00:00.000Z"
    },
    {
      "id": "msg2",
      "role": "assistant",
      "content": "Hello, human! How can I help you today?",
      "timestamp": "2023-01-01T12:00:05.000Z"
    }
  ]
}
```

### Get messages for a conversation:

```
GET /api/messages/12345
```

## Integration with Frontend

This backend is designed to work with the Vue3 AI Chat Application. The frontend communicates with this server to store and retrieve chat history.

## Database Schema

### Conversation

- `conversationId`: Unique identifier for the conversation
- `title`: Title of the conversation
- `createdAt`: When the conversation was created
- `updatedAt`: When the conversation was last updated

### Message

- `messageId`: Unique identifier for the message
- `role`: Either "user" or "assistant"
- `content`: The message text
- `timestamp`: When the message was sent
- `conversationId`: Reference to the conversation this message belongs to
