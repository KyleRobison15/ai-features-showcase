# AI Chatbot Application - Project Documentation

## Project Overview

This is a full-stack AI-powered chatbot application built as a customer support agent for Miller's Mountain Bikes. The chatbot uses OpenAI's GPT-4o-mini model to provide intelligent, context-aware responses about bike shop products, services, hours, and rentals.

**Technology Stack:**
- Bun runtime (JavaScript runtime & package manager)
- TypeScript 5.x
- Monorepo with Bun workspaces
- Server: Express.js + OpenAI SDK
- Client: React 19 + Vite + Tailwind CSS
- Validation: Zod schema validation
- Developer Tools: Prettier, Husky, lint-staged, ESLint

## Project Architecture

### Monorepo Structure

This project uses a **monorepo architecture** with Bun workspaces:

```
ai-features-showcase/
├── packages/
│   ├── client/          # React frontend application
│   └── server/          # Express backend API
├── index.ts             # Development launcher (runs both client & server)
├── package.json         # Root package.json with workspaces config
├── bun.lock             # Bun lockfile
├── tsconfig.json        # Shared TypeScript configuration
└── .husky/              # Git hooks for code quality
```

**Benefits of this architecture:**
- Shared configuration and dependencies
- Single command to run both client and server
- Unified TypeScript configuration
- Coordinated versioning

### Server Architecture (Express + TypeScript)

**Location:** `packages/server/`

The server follows a **layered architecture** with clear separation of concerns:

```
packages/server/
├── index.ts                           # Application entry point
├── routes.ts                          # Route definitions
├── controllers/
│   └── chat.controller.ts             # Request handling & validation
├── services/
│   └── chat.service.ts                # Business logic & OpenAI integration
├── repositories/
│   └── conversation.repository.ts     # Data access layer
└── prompts/
    ├── chatbot.txt                    # System prompt template
    └── MillersMountainBikes.md        # Shop information for context
```

#### Layer Responsibilities

**1. Controller Layer** (`controllers/chat.controller.ts`)
- **Single Responsibility:** Act as the gateway to the application
- Request routing and validation
- Zod schema validation for incoming requests
- HTTP response formatting
- Error handling

```typescript
// Example: Validates request body before passing to service
const chatSchema = z.object({
   prompt: z.string().trim().min(1).max(1000),
   conversationId: z.uuid(),
});
```

**2. Service Layer** (`services/chat.service.ts`)
- **Single Responsibility:** Handle application business logic
- OpenAI API integration
- Platform-agnostic response formatting
- Conversation context management
- Prompt templating

**Key Design Decision:** The service returns a generic `ChatResponse` type instead of OpenAI-specific responses, enabling easy swapping of LLM providers without changing the controller or client code.

**3. Repository Layer** (`repositories/conversation.repository.ts`)
- **Single Responsibility:** Handle data access logic
- Conversation state persistence (currently in-memory Map)
- Clean public interface hides implementation details

**Current Implementation:** Uses an in-memory `Map<string, string>` to track conversation IDs → last OpenAI response IDs. In production, this would be replaced with a database (Redis, PostgreSQL, etc.) without changing the public interface.

### Client Architecture (React + Vite)

**Location:** `packages/client/`

The client is a modern React application using functional components and hooks:

```
packages/client/
├── src/
│   ├── main.tsx                    # Application entry point
│   ├── App.tsx                     # Root component
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatBot.tsx         # Main chatbot container
│   │   │   ├── ChatInput.tsx       # Message input form
│   │   │   ├── ChatMessages.tsx    # Message list display
│   │   │   └── TypingIndicator.tsx # Loading animation
│   │   └── ui/
│   │       └── button.tsx          # Reusable button component
│   ├── assets/
│   │   └── sounds/                 # Audio feedback files
│   ├── lib/
│   │   └── utils.ts                # Utility functions
│   ├── App.css
│   └── index.css
├── vite.config.ts                  # Vite configuration
├── tailwind.config.js              # Tailwind CSS configuration
└── package.json
```

#### Component Architecture

**ChatBot Component** (`ChatBot.tsx`)
- Main container managing chat state
- Handles API communication with server
- Manages loading and error states
- Generates unique conversation ID per session
- Plays sound effects for UX feedback

**State Management:**
```typescript
const [messages, setMessages] = useState<Message[]>([]);
const [error, setError] = useState('');
const [isBotTyping, setIsBotTyping] = useState(false);
const conversationId = useRef(crypto.randomUUID()); // Persists across re-renders
```

**ChatMessages Component** (`ChatMessages.tsx`)
- Renders message list with styling
- Auto-scrolls to latest message using refs
- Supports markdown rendering via `react-markdown`
- Custom copy-to-clipboard handling

**ChatInput Component** (`ChatInput.tsx`)
- Form handling with `react-hook-form`
- Real-time validation
- Enter key to submit (Shift+Enter for new line)
- 1000 character limit

**TypingIndicator Component** (`TypingIndicator.tsx`)
- Animated three-dot loading indicator
- Staggered animation using Tailwind animation delays

## AI Integration (OpenAI)

### How the Chatbot Works

**1. System Prompt Configuration** (`prompts/chatbot.txt`)
```
You are a customer support agent for a Mountain Bike specific Bike Shop called Miller's Mountain Bikes.

Here is some key information about the shop: 
{{shopInfo}}

Only answer questions related to Miller's Mountain Bikes.
Always answer in a cheerful tone, like you are passionate about mountain biking, and avoid making up information.
```

**2. Dynamic Context Injection** (`services/chat.service.ts:21-27`)
- On server startup, reads `MillersMountainBikes.md` (shop details)
- Replaces `{{shopInfo}}` placeholder in template
- Result cached in memory for performance
- Same instructions used for all requests

**3. Conversation Context Management**
- Uses OpenAI's `responses` API (not the older chat completions)
- Conversation context maintained via `previous_response_id` parameter
- Server tracks mapping: `conversationId → lastResponseId`
- Client generates UUID once per session via `useRef`

**4. Request Flow**

```
User Input (Client)
    ↓
POST /api/chat { prompt, conversationId }
    ↓
Controller validates with Zod
    ↓
Service calls OpenAI API with:
    - model: 'gpt-4o-mini'
    - instructions: (system prompt + shop info)
    - input: (user's message)
    - previous_response_id: (from repository)
    - temperature: 0.2 (more deterministic)
    - max_output_tokens: 200
    ↓
Repository stores new response ID
    ↓
Service returns platform-agnostic ChatResponse
    ↓
Controller sends JSON response
    ↓
Client updates UI + plays notification sound
```

### Configuration

**Environment Variables Required** (`.env`):
```bash
OPENAI_API_KEY=sk-...
PORT=3000  # Optional, defaults to 3000
```

**Model Configuration** (`services/chat.service.ts:40-46`):
- **Model:** `gpt-4o-mini` (cost-effective, fast)
- **Temperature:** 0.2 (more consistent, less creative)
- **Max Tokens:** 200 (keeps responses concise)
- **Instructions:** System prompt with shop context

## Data Flow

### Complete Request/Response Cycle

**User sends message:**

1. **Client** (`ChatBot.tsx:30-36`)
   - User types message and presses Enter
   - Form validated by `react-hook-form`
   - Message immediately added to UI (optimistic update)
   - Loading indicator shown
   - "Pop" sound played

2. **HTTP Request**
   ```typescript
   POST http://localhost:5173/api/chat  // Proxied by Vite
   
   Request Body:
   {
     "prompt": "What are your store hours?",
     "conversationId": "550e8400-e29b-41d4-a716-446655440000"
   }
   ```

3. **Server** (`routes.ts:16`)
   - Request routed to `chatController.sendMessage`

4. **Controller** (`chat.controller.ts:13-26`)
   - Validates request with Zod schema
   - Returns 400 if validation fails
   - Calls service layer
   - Returns 500 if service throws error

5. **Service** (`chat.service.ts:39-57`)
   - Retrieves previous response ID from repository
   - Calls OpenAI API
   - Stores new response ID in repository
   - Returns platform-agnostic response

6. **Repository** (`conversation.repository.ts`)
   - Looks up conversation ID in Map
   - Returns previous response ID (or undefined for first message)
   - Stores new response ID

7. **HTTP Response**
   ```json
   {
     "message": "Miller's Mountain Bikes is open from 10:00 AM to 7:00 PM..."
   }
   ```

8. **Client** (`ChatBot.tsx:44-51`)
   - Response added to messages array
   - Loading indicator hidden
   - Notification sound played
   - Auto-scrolls to new message

## Development Setup

### Prerequisites

- **Bun:** v1.3.3 or higher (JavaScript runtime)
  ```bash
  # Install Bun
  curl -fsSL https://bun.sh/install | bash
  ```
- **OpenAI API Key:** Sign up at https://platform.openai.com

### Installation

1. **Clone and install dependencies:**
   ```bash
   cd /path/to/ai-features-showcase
   bun install
   ```

2. **Set up environment variables:**
   ```bash
   # In packages/server/.env
   OPENAI_API_KEY=sk-your-key-here
   PORT=3000
   ```

3. **Run the application:**
   ```bash
   # From root directory - runs both client and server
   bun run dev
   ```

   This command:
   - Starts server on `http://localhost:3000`
   - Starts client on `http://localhost:5173`
   - Enables hot reload for both

**What happens under the hood** (`index.ts`):
```typescript
import concurrently from 'concurrently';

concurrently([
   { name: 'server', command: 'bun run dev', cwd: 'packages/server' },
   { name: 'client', command: 'bun run dev', cwd: 'packages/client' },
]);
```

### Development URLs

- **Client:** http://localhost:5173
- **Server:** http://localhost:3000
- **API Endpoint:** http://localhost:5173/api/chat (proxied by Vite)

### Vite Proxy Configuration

**Why proxy?** Avoids CORS issues during development.

**Configuration** (`packages/client/vite.config.ts:14-18`):
```typescript
server: {
   proxy: {
      '/api': 'http://localhost:3000',
   },
}
```

**Result:** Requests to `http://localhost:5173/api/chat` are forwarded to `http://localhost:3000/api/chat`

## Code Quality Tools

### Prettier (Code Formatting)

**Config** (`.prettierrc`):
```json
{
   "singleQuote": true,
   "semi": true,
   "tabWidth": 3
}
```

**Usage:**
```bash
bun run format  # Format all files
```

### Husky (Git Hooks)

**Pre-commit hook** (`.husky/pre-commit`):
- Automatically runs on `git commit`
- Executes lint-staged

### Lint-staged

**Config** (`.lintstagedrc`):
```json
{
   "**/*.{ts,tsx,js,jsx}": ["prettier --write"]
}
```

**Behavior:** Formats only staged files before commit

## Key Features

### 1. Conversation Context Preservation

Each user session has a unique conversation ID that persists for the entire browser session. The server tracks the OpenAI response chain, allowing the AI to remember previous messages:

```typescript
// Client generates UUID once per session
const conversationId = useRef(crypto.randomUUID());

// Server maintains conversation history via response IDs
previous_response_id: conversationRepository.getLastResponseId(conversationId)
```

### 2. Markdown Support

Bot responses support markdown formatting (bold, italics, lists, etc.) via `react-markdown`:

```typescript
import ReactMarkdown from 'react-markdown';

<ReactMarkdown>{message.content}</ReactMarkdown>
```

### 3. Sound Effects

**User message sent:** Pop sound (20% volume)
**Bot response received:** Notification sound (20% volume)

**Implementation** (`ChatBot.tsx:9-13`):
```typescript
const popAudio = new Audio(popSound);
popAudio.volume = 0.2;

const notificationAudio = new Audio(notificationSound);
notificationAudio.volume = 0.2;
```

### 4. Auto-scroll to Latest Message

Uses React refs and `useEffect` to scroll smoothly when new messages arrive:

```typescript
const lastMessageRef = useRef<HTMLDivElement | null>(null);

useEffect(() => {
   lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [messages]);
```

### 5. Real-time Validation

Form validation via `react-hook-form`:
- Prompt required
- Prompt must not be empty/whitespace
- 1000 character limit
- Submit button disabled until valid

### 6. Loading States

- Typing indicator with animated dots
- Form disabled during API request
- Error messages displayed prominently

## Coding Standards

### Naming Conventions

- **Components:** PascalCase (`ChatBot`, `ChatInput`)
- **Functions/Variables:** camelCase (`sendMessage`, `conversationId`)
- **Types/Interfaces:** PascalCase (`Message`, `ChatResponse`)
- **Files:** Match component name (`ChatBot.tsx`)

### TypeScript Best Practices

**Use explicit types for props:**
```typescript
type Props = {
   messages: Message[];
};

const ChatMessages = ({ messages }: Props) => { ... }
```

**Export types when shared:**
```typescript
export type Message = {
   content: string;
   role: 'user' | 'bot';
};
```

**Use generic types for flexibility:**
```typescript
const [messages, setMessages] = useState<Message[]>([]);
```

### React Best Practices

**Use functional components:**
```typescript
const ChatBot = () => { ... }
```

**Use hooks appropriately:**
- `useState` for component state
- `useRef` for persistent values that don't trigger re-renders
- `useEffect` for side effects
- `useForm` for form state management

**Keep components focused:**
- Each component has a single responsibility
- Extract reusable UI into separate components (`button.tsx`)

### Separation of Concerns

**Server layers must not be mixed:**
- Controllers handle HTTP requests only
- Services handle business logic only
- Repositories handle data access only

**Public interfaces over implementation:**
```typescript
// ❌ Don't expose implementation
export const conversations = new Map();

// ✅ Expose clean interface
export const conversationRepository = {
   getLastResponseId(conversationId: string) { ... },
   setLastResponseId(conversationId: string, responseId: string) { ... }
};
```

## Common Tasks

### Add a New API Endpoint

1. **Define route** (`packages/server/routes.ts`):
   ```typescript
   router.post('/api/new-endpoint', myController.handleRequest);
   ```

2. **Create controller** (`packages/server/controllers/my.controller.ts`):
   ```typescript
   import { Request, Response } from 'express';
   import z from 'zod';

   const schema = z.object({ ... });

   export const myController = {
      async handleRequest(req: Request, res: Response) {
         const parseResult = schema.safeParse(req.body);
         if (!parseResult.success) {
            res.status(400).json(parseResult.error.format());
            return;
         }
         // Handle request...
      }
   };
   ```

3. **Create service** (if needed) for business logic

4. **Update client** to call new endpoint

### Modify System Prompt

1. Edit `packages/server/prompts/chatbot.txt`
2. Modify the shop information in `packages/server/prompts/MillersMountainBikes.md`
3. Restart server (prompts are loaded once at startup)

### Add a New React Component

1. **Create component file** in appropriate directory:
   ```typescript
   // packages/client/src/components/MyComponent.tsx
   type Props = {
      // Define props
   };

   const MyComponent = ({ }: Props) => {
      return <div>...</div>;
   };

   export default MyComponent;
   ```

2. **Import and use:**
   ```typescript
   import MyComponent from './components/MyComponent';
   ```

### Switch LLM Provider

The architecture is designed to make this easy:

1. **Install new SDK** (e.g., Anthropic Claude):
   ```bash
   cd packages/server
   bun add @anthropic-ai/sdk
   ```

2. **Update service** (`services/chat.service.ts`):
   ```typescript
   import Anthropic from '@anthropic-ai/sdk';

   const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
   });

   // Update sendMessage implementation
   // Keep same ChatResponse return type
   ```

3. **No changes needed in controller or client!**

## Production Considerations

### Current Limitations

**1. In-Memory Conversation Storage**
- Location: `repositories/conversation.repository.ts`
- Issue: State lost on server restart
- Solution: Replace Map with Redis or PostgreSQL

**2. No Authentication**
- Anyone can use the chatbot
- No rate limiting per user
- Solution: Add JWT authentication, track usage by user

**3. No Conversation History UI**
- Users can't see past conversations
- Solution: Store full conversation history in DB, add UI to view/resume conversations

**4. No Error Logging**
- Console.log only
- Solution: Integrate Sentry, Datadog, or similar

**5. OpenAI API Key in Environment**
- Requires secure environment variable management
- Solution: Use secrets management (AWS Secrets Manager, etc.)

### Performance Optimizations

**1. Response Caching**
- Cache common questions (e.g., "What are your hours?")
- Use Redis with TTL

**2. Rate Limiting**
- Prevent API abuse
- Use `express-rate-limit`

**3. Response Streaming**
- Stream OpenAI responses for better UX
- Use Server-Sent Events (SSE) or WebSocket

**4. Database Indexes**
- When moving to database, index `conversationId`

### Deployment Checklist

- [ ] Replace in-memory storage with persistent database
- [ ] Add authentication and authorization
- [ ] Implement rate limiting
- [ ] Set up error monitoring (Sentry)
- [ ] Configure environment variables securely
- [ ] Add health check endpoint
- [ ] Set up CI/CD pipeline
- [ ] Configure CORS for production domain
- [ ] Add API versioning
- [ ] Implement request logging
- [ ] Set up SSL/TLS certificates
- [ ] Configure CDN for static assets

## Useful Commands

```bash
# Install dependencies
bun install

# Run development environment (both client & server)
bun run dev

# Run server only
cd packages/server && bun run dev

# Run client only
cd packages/client && bun run dev

# Format code
bun run format

# Build client for production
cd packages/client && bun run build

# Preview production build
cd packages/client && bun run preview

# Run linter
cd packages/client && bun run lint
```

## Troubleshooting

### Server won't start

**Check OpenAI API key:**
```bash
echo $OPENAI_API_KEY  # Should print your key
```

**Check port availability:**
```bash
lsof -i :3000  # Check if port 3000 is in use
```

### Client can't connect to server

**Check Vite proxy config:**
- File: `packages/client/vite.config.ts`
- Should proxy `/api` to `http://localhost:3000`

**Check server is running:**
```bash
curl http://localhost:3000/api/hello
# Should return: {"message":"Hello World!"}
```

### OpenAI API errors

**Check API key validity:**
- Visit https://platform.openai.com/api-keys
- Verify key has not expired
- Check billing account has credits

**Check rate limits:**
- OpenAI has rate limits per tier
- Implement exponential backoff for retries

### Husky hooks not running

**Reinstall hooks:**
```bash
bun run prepare
```

## Architecture Diagrams

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     User Browser                         │
│                                                          │
│  ┌────────────────────────────────────────────────┐   │
│  │         React Client (localhost:5173)           │   │
│  │                                                  │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐     │   │
│  │  │ ChatBot  │─▶│ChatInput │  │ Messages │     │   │
│  │  └──────────┘  └──────────┘  └──────────┘     │   │
│  │                                                  │   │
│  └────────────────────┬─────────────────────────────┘   │
└───────────────────────┼─────────────────────────────────┘
                        │ HTTP (Proxied by Vite)
                        ▼
┌─────────────────────────────────────────────────────────┐
│              Express Server (localhost:3000)             │
│                                                          │
│  ┌──────────┐    ┌──────────┐    ┌──────────────┐     │
│  │Controller│───▶│ Service  │───▶│ Repository   │     │
│  │(routes)  │    │(business)│    │(data access) │     │
│  └──────────┘    └────┬─────┘    └──────────────┘     │
│                       │                                  │
│                       │ OpenAI SDK                      │
└───────────────────────┼─────────────────────────────────┘
                        │
                        ▼
              ┌─────────────────┐
              │   OpenAI API    │
              │  (gpt-4o-mini)  │
              └─────────────────┘
```

### Data Flow Sequence

```
User → ChatInput → ChatBot → axios.post()
                                    ↓
                          Express routes.ts
                                    ↓
                          chat.controller.ts
                          (Zod validation)
                                    ↓
                          chat.service.ts
                                    ↓
                    conversation.repository.ts
                    (get previous response ID)
                                    ↓
                          OpenAI API call
                          (with context)
                                    ↓
                    conversation.repository.ts
                    (store new response ID)
                                    ↓
                          chat.service.ts
                    (format ChatResponse)
                                    ↓
                          chat.controller.ts
                          (send JSON response)
                                    ↓
ChatBot ← axios response ← Express server
  ↓
Update state → ChatMessages → Render
```

## Reference Documentation

- **Bun:** https://bun.sh/docs
- **OpenAI Node SDK:** https://github.com/openai/openai-node
- **Express:** https://expressjs.com/
- **React:** https://react.dev/
- **Vite:** https://vitejs.dev/
- **Tailwind CSS:** https://tailwindcss.com/
- **Zod:** https://zod.dev/
- **React Hook Form:** https://react-hook-form.com/
- **React Markdown:** https://github.com/remarkjs/react-markdown

## License

This is a learning project. Feel free to use as reference or template for your own projects.
