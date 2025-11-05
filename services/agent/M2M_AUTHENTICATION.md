# M2M (Machine-to-Machine) Authentication in Agent Service

## Overview

The agent service now implements JWT-based M2M authentication, similar to the API service. This ensures that only authorized clients can access the agent service endpoints.

## Implementation Details

### 1. Environment Configuration

The agent service requires a `JWT_SECRET` environment variable:

```bash
# In services/agent/.env or .env.local
JWT_SECRET=your-secret-key-here
```

**Important:** The JWT_SECRET must be the same as the one used in the API service to ensure tokens can be verified consistently across services.

### 2. Authentication Flow

1. **Token Generation**: Tokens are generated using the `scripts/generate-tokens.sh` script:
   ```bash
   ./scripts/generate-tokens.sh agent
   ```

2. **Token Verification**: The agent service uses `express-jwt` middleware to verify Bearer tokens on all endpoints except `/v1/healthcheck`.

3. **Request Flow**:
   - Client includes token in Authorization header: `Bearer <token>`
   - `express-jwt` middleware verifies the token signature
   - If valid, the request proceeds to the route handler
   - If invalid, a 401 Unauthorized response is returned

### 3. Protected Endpoints

Authentication is handled per-route using `authenticationHandler` middleware. This approach provides:
- Fine-grained permission control
- Support for both User and ServiceClient tokens
- No global authentication layer (unlike older JWT middleware patterns)

Public endpoints (no authentication required):
- `GET /v1/healthcheck` - Health check endpoint

**Current Authentication Status:**

Protected endpoints (require `admin:read` permission):
- ✅ `POST /v1/chat` - Send chat messages (protected)

Unprotected endpoints (currently public):
- ⚠️ `GET /v1/chat` - List chat conversations (no auth middleware)
- ⚠️ `GET /v1/chat/:id` - Get chat conversation (no auth middleware)
- ⚠️ `DELETE /v1/chat/:id` - Delete chat conversation (no auth middleware)

**Note**: Consider adding `authenticationHandler([AdminRead.literals[0]])(ctx)` to the List, Get, and Delete chat routes for consistency and security.

### 4. Code Architecture

#### Context Updates
- Added `JWTProviderContext` to `AgentContext` type
- Initialized `JWTProvider` in context loader with `JWT_SECRET`

#### Middleware Configuration
The agent service's `run.ts` includes JWT middleware:

```typescript
const jwtMiddleware: any = jwt({
  secret: ctx.env.JWT_SECRET,
  algorithms: ["HS256"],
});
jwtMiddleware.unless = unless;
app.use(
  jwtMiddleware.unless({
    path: [{ url: "/v1/healthcheck", method: "GET" }],
  }),
);
```

## Usage

### Generating Service Tokens

Use the provided script to generate tokens with appropriate permissions:

```bash
# Generate token for agent service
./scripts/generate-tokens.sh agent

# The script outputs:
# - Token ID
# - User ID
# - Permissions
# - JWT token
# - Environment variable line to copy
```

### Making Authenticated Requests

Include the token in the Authorization header:

```bash
curl -H "Authorization: Bearer <your-token>" \
  http://agent.liexp.dev/v1/chat \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "conversation_id": null}'
```

### Testing Locally

1. Generate a token:
   ```bash
   ./scripts/generate-tokens.sh agent
   ```

2. Add the token to your environment:
   ```bash
   # In services/agent/.env.local
   JWT_SECRET=<same-as-api-service>
   ```

3. Start the agent service:
   ```bash
   docker compose up agent.liexp.dev
   ```

4. Test the healthcheck (no auth required):
   ```bash
   curl http://agent.liexp.dev/v1/healthcheck
   ```

5. Test a protected endpoint:
   ```bash
   curl -H "Authorization: Bearer <token>" \
     http://agent.liexp.dev/v1/chat \
     -X POST \
     -H "Content-Type: application/json" \
     -d '{"message": "Test", "conversation_id": null}'
   ```

## Security Considerations

1. **Token Storage**: Store tokens securely in environment variables or secrets management systems
2. **Token Rotation**: Regularly rotate tokens for production services
3. **Secret Management**: Never commit `JWT_SECRET` or tokens to version control
4. **HTTPS Only**: Always use HTTPS in production to prevent token interception
5. **Token Expiry**: Service tokens have a 1-year expiration by default
6. **Permissions**: Tokens include permissions that can be checked for authorization

## Integration with AI-Bot Service

The `ai-bot` service uses the agent service via the `ts-endpoint` resource client:

```typescript
// In ai-bot context
const agentRestClient = axios.create({
  baseURL: config.agent.url,
  headers: {
    "Content-Type": "application/json",
  },
});

// Authorization interceptor
agentRestClient.interceptors.request.use((req) => {
  req.headers.Authorization = `Bearer ${env.API_TOKEN}`;
  return req;
});

// Create agent client
const agent = GetResourceClient(agentRestClient, AgentEndpoints, {
  decode: EffectDecoder((e) =>
    DecodeError.of("Agent client decode error", e),
  ),
});
```

## Troubleshooting

### 401 Unauthorized Errors

1. **Check token format**: Ensure it starts with `Bearer `
2. **Verify JWT_SECRET**: Must match between token generation and verification
3. **Check token expiry**: Tokens expire after 1 year
4. **Validate token structure**: Use jwt.io to decode and inspect the token

### Environment Variable Issues

1. **Missing JWT_SECRET**: Check `.env` and `.env.local` files
2. **Wrong secret**: Token verification will fail if secrets don't match
3. **Environment not loaded**: Ensure dotenv loads before the service starts

### Connection Issues

1. **Service not running**: Check `docker compose ps`
2. **Port conflicts**: Ensure port 80 is available in the container
3. **Network issues**: Verify services are on the same Docker network

