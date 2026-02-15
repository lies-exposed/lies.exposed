# Multi-Provider AI Configuration for Admin Chat

## Overview

This document outlines the implementation plan for supporting multiple AI provider configurations in the admin chat interface provided by `agent.liexp.dev`. Currently, the system creates a single agent during server bootstrap with a fixed LLM provider. This implementation will enable dynamic agent creation with provider configuration specified per-request.

## Current Architecture Issues

### Bootstrap-Time Agent Creation
- **Location**: `services/agent/src/flows/chat/chat.flow.ts`
- **Problem**: Agent is created once during server initialization with a fixed provider configuration
- **Impact**: Cannot switch providers per conversation or per request without server restart

### Single Provider Initialization
- **Location**: `packages/@liexp/backend/src/providers/ai/langchain.provider.ts`
- **Current Flow**: 
  1. Environment variables define provider (OpenAI, Anthropic, XAI)
  2. `GetLangchainProvider()` creates single chat model during bootstrap
  3. Same model used for all requests

### Static Agent Configuration
- **Location**: `packages/@liexp/backend/src/providers/ai/agent.provider.ts`
- **Current Flow**:
  1. `GetAgentProvider()` creates agent once
  2. Uses fixed `ctx.langchain.chat` model
  3. No way to override per-request

## Proposed Solution

### 1. Extended Chat Message Schema

Add provider configuration fields to the chat request:

```typescript
// packages/@liexp/io/src/http/Chat.ts
export interface ChatMessageRequest {
  // Existing fields
  conversationId?: string;
  message: string;
  context?: unknown;
  
  // NEW: Provider configuration (optional)
  aiConfig?: {
    provider: "openai" | "anthropic" | "xai";
    model?: AvailableModels;
    
    // Optional: Override default provider settings
    options?: {
      temperature?: number;
      maxTokens?: number;
      topP?: number;
      frequencyPenalty?: number;
    };
  };
}
```

### 2. Agent Service Changes

#### 2.1 Refactor `GetAgentProvider` to Support On-Demand Creation

**File**: `packages/@liexp/backend/src/providers/ai/agent.provider.ts`

```typescript
// NEW: Factory function for creating agents on demand
export const CreateAgentFactory = 
  (opts: GetAgentProviderOptions) =>
  <C extends LangchainContext & LoggerContext & PuppeteerProviderContext & BraveProviderContext>(
    ctx: C,
  ): ((providerConfig?: ProviderConfigOverride) => TaskEither<ServerError, Agent>) => {
    return (providerConfig?: ProviderConfigOverride) => {
      // Create a temporary LangchainProvider with merged config
      const mergedConfig = mergeProviderConfig(ctx.langchain.options, providerConfig);
      const tempLangchainProvider = GetLangchainProvider(mergedConfig);
      
      return createAgentWithModel(tempLangchainProvider.chat, opts.mcpClient, ctx);
    };
  };

// Helper to merge request-level config with defaults
function mergeProviderConfig(
  defaultConfig: LangchainProviderOptions<any>,
  override?: ProviderConfigOverride,
): LangchainProviderOptions<any> {
  if (!override) return defaultConfig;
  
  return {
    ...defaultConfig,
    provider: override.provider ?? defaultConfig.provider,
    models: {
      ...defaultConfig.models,
      chat: override.model ?? defaultConfig.models?.chat,
    },
    options: {
      ...defaultConfig.options,
      chat: {
        ...defaultConfig.options?.chat,
        ...override.options,
      },
    },
  };
}
```

#### 2.2 Update Chat Flow to Use Provider Config

**File**: `services/agent/src/flows/chat/chat.flow.ts`

```typescript
export const sendChatMessage = 
  (request: ChatMessageRequest) =>
  <C extends AgentContext>(ctx: C) =>
    pipe(
      // Get or create agent with specified provider config
      getOrCreateAgent(request.aiConfig)(ctx),
      TE.chain((agent) => {
        // Use agent with request provider configuration
        return runAgent(agent, request.message, ctx);
      }),
      // ... rest of implementation
    );

// Helper to select/create appropriate agent
const getOrCreateAgent =
  (config?: ProviderConfigOverride) =>
  <C extends AgentContext>(ctx: C): TaskEither<ServerError, Agent> => {
    if (!config) {
      // Use default agent (created at bootstrap)
      return TE.right(ctx.agent);
    }
    
    // Create new agent with specified config
    return ctx.agentFactory(config);
  };
```

### 3. Admin Service Changes

#### 3.1 Create Provider Registry

**New File**: `services/admin/src/server/providers/aiProvider.registry.ts`

```typescript
import { GetLangchainProvider, type AvailableModels, type AIProvider } from "@liexp/backend/lib/providers/ai/langchain.provider.js";
import { type ServerError } from "@liexp/backend/lib/errors/ServerError.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type AdminProxyENV } from "../io/ENV.js";

export interface ProviderConfig {
  provider: AIProvider;
  model?: AvailableModels;
  baseURL?: string;
  apiKey?: string;
  options?: Record<string, unknown>;
}

export interface AIProviderRegistry {
  // Validate provider config
  validate: (config: ProviderConfig) => TE.TaskEither<ServerError, ProviderConfig>;
  
  // Get available providers
  listAvailable: () => AIProvider[];
  
  // Get provider details
  getInfo: (provider: AIProvider) => ProviderInfo;
}

export interface ProviderInfo {
  name: string;
  models: AvailableModels[];
  baseURL: string;
  requiresApiKey: boolean;
}

export const GetAIProviderRegistry = (env: AdminProxyENV): AIProviderRegistry => {
  const providers = new Map<AIProvider, ProviderInfo>([
    ["openai", {
      name: "OpenAI",
      models: ["gpt-4", "gpt-4o"],
      baseURL: env.OPENAI_BASE_URL ?? "https://api.openai.com/v1",
      requiresApiKey: true,
    }],
    ["anthropic", {
      name: "Anthropic Claude",
      models: ["claude-sonnet-4-20250514", "claude-3-5-haiku-latest"],
      baseURL: "https://api.anthropic.com",
      requiresApiKey: true,
    }],
    ["xai", {
      name: "XAI Grok",
      models: ["grok-4-fast"],
      baseURL: "https://api.x.ai/v1",
      requiresApiKey: true,
    }],
  ]);

  const validate = (config: ProviderConfig) =>
    pipe(
      TE.Do,
      TE.chain(() => {
        if (!providers.has(config.provider)) {
          return TE.left(ServerError.fromMessage(`Invalid provider: ${config.provider}`));
        }
        return TE.right(config);
      }),
    );

  return {
    validate,
    listAvailable: () => Array.from(providers.keys()),
    getInfo: (provider: AIProvider) => {
      const info = providers.get(provider);
      if (!info) throw new Error(`Unknown provider: ${provider}`);
      return info;
    },
  };
};
```

#### 3.2 Update Admin Proxy Context

**File**: `services/admin/src/server/context/index.ts`

```typescript
export interface AdminProxyContext {
  logger: ReturnType<typeof GetLogger>;
  jwt: ReturnType<typeof GetJWTProvider>;
  m2m: ReturnType<typeof makeM2MTokenProvider>;
  agent: ReturnType<typeof makeAgentClient>;
  env: AdminProxyENV;
  // NEW:
  aiRegistry: AIProviderRegistry;
}

export const makeAdminProxyContext = (env: AdminProxyENV) => {
  return pipe(
    // ... existing initialization
    TE.bind("aiRegistry", () =>
      pipe(
        GetAIProviderRegistry(env),
        TE.right,
      ),
    ),
    // ... rest of binding
  );
};
```

#### 3.3 Update Proxy Route to Pass Provider Config

**File**: `services/admin/src/server/routes/agent-proxy.routes.ts`

```typescript
// In the POST /chat/message endpoint
router.post(
  "/chat/message",
  authenticationHandler([AdminRead.literals[0]])(ctx),
  chatRateLimiter,
  auditMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    const correlationId = generateCorrelationId();
    
    // Extract provider config from request if present
    const aiConfig = extractAIConfig(req.body);
    
    // Validate provider config if provided
    const validationTask = aiConfig 
      ? ctx.aiRegistry.validate(aiConfig)
      : TE.right(undefined);

    pipe(
      TE.fromIO(() => m2m.getToken()),
      TE.chain(() => validationTask),
      TE.chain((validatedConfig) => {
        // Pass provider config to agent service in request body
        const agentRequest = {
          ...req.body,
          aiConfig: validatedConfig,
        };
        
        return agent.Chat.Create({
          Body: agentRequest,
        });
      }),
      // ... error handling
    )().catch((e) => next(e));
  },
);

function extractAIConfig(body: any): ProviderConfig | undefined {
  return body?.aiConfig ? {
    provider: body.aiConfig.provider,
    model: body.aiConfig.model,
    options: body.aiConfig.options,
  } : undefined;
}
```

### 4. Context Configuration

#### 4.1 Extend Agent Context

**File**: `services/agent/src/context/agent.context.ts`

```typescript
export interface AgentContext {
  // ... existing
  logger: Logger;
  langchain: LangchainProvider<AIProvider>;
  
  // NEW: Factory for creating agents on demand
  agentFactory: (
    config?: ProviderConfigOverride,
  ) => TaskEither<ServerError, Agent>;
}

export interface ProviderConfigOverride {
  provider?: AIProvider;
  model?: AvailableModels;
  options?: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
  };
}
```

#### 4.2 Update Bootstrap Process

**File**: `services/agent/src/server/createApp.ts`

```typescript
// During context initialization:
const agentContext = {
  ...ctx,
  // Store factory function instead of static agent
  agentFactory: CreateAgentFactory({
    mcpClient: ctx.mcp,
  })(ctx),
};
```

### 5. Type Updates

#### 5.1 Extend Chat Message Types

**File**: `packages/@liexp/io/src/http/Chat.ts`

```typescript
import { type AIProvider, type AvailableModels } from "@liexp/backend/lib/providers/ai/langchain.provider.js";

export interface ChatMessageRequest {
  conversationId?: string;
  message: string;
  context?: unknown;
  
  // NEW: AI provider configuration
  aiConfig?: {
    provider: AIProvider;
    model?: AvailableModels;
    options?: {
      temperature?: number;
      maxTokens?: number;
      topP?: number;
      frequencyPenalty?: number;
    };
  };
}

export interface ChatMessageResponse {
  conversationId: string;
  response: string;
  
  // NEW: Confirm which provider was used
  usedProvider: {
    provider: AIProvider;
    model: AvailableModels;
  };
  
  tokens?: {
    input: number;
    output: number;
  };
}
```

### 6. Frontend Components

#### 6.1 Provider Selection Component

**New File**: `services/admin/src/components/chat/ProviderSelector.tsx`

```typescript
import React, { useEffect, useState } from "react";
import type { AIProvider, AvailableModels } from "@liexp/backend/lib/providers/ai/langchain.provider";

interface ProviderSelectorProps {
  currentProvider?: AIProvider;
  currentModel?: AvailableModels;
  onConfigChange: (config: {
    provider: AIProvider;
    model?: AvailableModels;
  }) => void;
  disabled?: boolean;
}

export const ProviderSelector: React.FC<ProviderSelectorProps> = ({
  currentProvider = "openai",
  currentModel,
  onConfigChange,
  disabled = false,
}) => {
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [models, setModels] = useState<AvailableModels[]>([]);

  useEffect(() => {
    // Fetch available providers from /api/proxy/agent/providers endpoint
    fetchProviders();
  }, []);

  useEffect(() => {
    // Update models when provider changes
    fetchModelsForProvider(currentProvider);
  }, [currentProvider]);

  return (
    <div className="provider-selector">
      <select
        value={currentProvider}
        onChange={(e) => onConfigChange({
          provider: e.target.value as AIProvider,
          model: undefined,
        })}
        disabled={disabled}
      >
        {providers.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>

      <select
        value={currentModel ?? ""}
        onChange={(e) => onConfigChange({
          provider: currentProvider,
          model: e.target.value as AvailableModels,
        })}
        disabled={disabled}
      >
        <option value="">Default model</option>
        {models.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
    </div>
  );
};
```

#### 6.2 Update useStreamingChat Hook

**File**: `services/admin/src/hooks/useStreamingChat.ts`

```typescript
interface UseStreamingChatOptions {
  aiConfig?: {
    provider: AIProvider;
    model?: AvailableModels;
  };
}

export const useStreamingChat = (options: UseStreamingChatOptions = {}) => {
  const sendMessage = async (message: string) => {
    const response = await fetch("/api/proxy/agent/chat/message/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        conversationId: currentConversationId,
        aiConfig: options.aiConfig, // Pass provider config
      }),
    });
    
    // ... stream processing
  };

  return { sendMessage, /* ... */ };
};
```

## Implementation Phases

### Phase 1: Backend Core (2-3 days)
1. Refactor `GetAgentProvider` to support factory pattern
2. Create provider registry in admin service
3. Update chat flow to accept and use provider config
4. Update context initialization

**Files Modified**:
- `packages/@liexp/backend/src/providers/ai/agent.provider.ts`
- `packages/@liexp/backend/src/providers/ai/langchain.provider.ts`
- `services/agent/src/flows/chat/chat.flow.ts`
- `services/admin/src/server/context/index.ts`
- `services/admin/src/server/routes/agent-proxy.routes.ts`
- `packages/@liexp/io/src/http/Chat.ts`

**Files Created**:
- `services/admin/src/server/providers/aiProvider.registry.ts`
- `services/agent/src/context/agent.context.ts`

### Phase 2: Validation & Error Handling (1-2 days)
1. Add provider config validation
2. Implement proper error responses
3. Add audit logging for provider changes
4. Rate limiting per provider (optional)

### Phase 3: Frontend UI (1-2 days)
1. Create provider selector component
2. Update chat interface
3. Add provider indicator in messages
4. Handle provider unavailability gracefully

### Phase 4: Testing (2-3 days)
1. Unit tests for provider registry
2. Integration tests for chat flow
3. E2E tests for provider switching
4. Load testing for concurrent different providers

### Phase 5: Documentation & Deployment (1 day)
1. Update API documentation
2. Update environment setup guide
3. Create migration guide
4. Deploy to staging/production

## Benefits

### Flexibility
- Switch AI providers per request without restarting
- Test different models within same conversation
- Optimize cost by using cheaper models for simple queries

### Scalability
- Support multi-tenant provider configurations
- Enable A/B testing between providers
- Allow gradual provider migrations

### User Experience
- Provider selection UI
- Clear indication of which provider was used
- Fallback to default if requested provider unavailable

## Risks & Mitigation

### Risk: API Key Management
**Mitigation**: Store provider API keys securely in environment, validate at startup

### Risk: Provider Switching in Conversation
**Mitigation**: Document limitations, allow per-message provider config, track in conversation history

### Risk: Performance Degradation
**Mitigation**: Cache provider instances, use connection pooling, monitor response times

### Risk: Type Safety
**Mitigation**: Strict TypeScript types, zod validation, comprehensive tests

## Success Criteria

- [ ] Admin chat supports provider selection without server restart
- [ ] Provider config passed through entire request chain
- [ ] Dynamic agent creation works for all 3 providers (OpenAI, Anthropic, XAI)
- [ ] Fallback to default provider if override unavailable
- [ ] Frontend shows selected provider clearly
- [ ] All tests pass (unit, integration, e2e)
- [ ] No performance degradation
- [ ] Backward compatible with existing chat requests

## Environment Variables

Add to `.env` and `docker-compose.yml`:

```bash
# Backup API keys for fallback (optional)
ANTHROPIC_API_KEY=sk-ant-...
XAI_API_KEY=xai-...

# Provider base URLs (optional overrides)
ANTHROPIC_BASE_URL=https://api.anthropic.com
XAI_BASE_URL=https://api.x.ai/v1
```

## Future Enhancements

1. **Provider Health Checks**: Periodically verify provider availability
2. **Cost Tracking**: Track costs per provider, optimize provider selection
3. **Provider Fallback**: Automatically switch providers if one fails
4. **Custom Prompts per Provider**: Optimize system prompts for each LLM
5. **Provider Analytics**: Track usage patterns and success rates
6. **Provider Rotation**: Automatically cycle through providers for load balancing

## References

- Current Agent Implementation: `services/agent/src/routes/chat/chat.controller.ts`
- Langchain Provider: `packages/@liexp/backend/src/providers/ai/langchain.provider.ts`
- Admin Service: `services/admin/src/server/routes/agent-proxy.routes.ts`
- Chat Flow: `services/agent/src/flows/chat/chat.flow.ts`
