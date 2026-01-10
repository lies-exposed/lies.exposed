# AdminChat Component

The AdminChat component provides an integrated AI assistant for the lies.exposed admin interface.

## Features

- **Floating Chat Button**: Always accessible chat interface
- **Real-time AI Responses**: Connects to the agent service for intelligent responses
- **Conversation History**: Maintains chat history within the session
- **Error Handling**: Graceful error handling with user-friendly messages
- **Responsive Design**: Works on desktop and mobile devices

## Usage

The AdminChat component is automatically integrated into the admin interface. It appears as a floating chat button in the bottom-right corner.

```tsx
import { AdminChat } from "./components/chat/AdminChat.js";

// Usage in the admin layout
export const AdminLayout = () => {
  return (
    <div>
      {/* Your admin content */}
      <AdminChat />
    </div>
  );
};
```

## Configuration

The component automatically detects the environment and uses the appropriate agent service URL:

- **Development**: `http://localhost:3003` (local agent service)
- **Production**: `http://agent.liexp.dev` (deployed agent service)

## Agent Service Integration

The AdminChat component communicates with the agent service via HTTP requests to the `/v1/chat/message` endpoint.

### Request Format
```json
{
  "message": "User's message",
  "conversation_id": "default"
}
```

### Response Format
```json
{
  "message": "AI assistant response",
  "conversationId": "default"
}
```

## Features

1. **Intelligent Assistance**: The AI assistant can help with:
   - Understanding platform features
   - Fact-checking guidance
   - Actor and event management
   - Data analysis questions

2. **Context Awareness**: The assistant understands the lies.exposed platform context and can provide relevant help.

3. **Conversation Management**: Maintains conversation context for better assistance.

## Error Handling

The component includes comprehensive error handling:
- Network connectivity issues
- Service unavailability
- Invalid responses
- User-friendly error messages

## Styling

The component uses Material-UI theming and includes:
- Floating action button design
- Modal chat interface
- Message bubbles with proper styling
- Responsive layout
- Theme-aware colors

## Dependencies

- React 18+
- Material-UI
- lies.exposed UI components
- Agent service running on port 3003 (development) or agent.liexp.dev (production)