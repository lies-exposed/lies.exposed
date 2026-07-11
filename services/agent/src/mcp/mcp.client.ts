import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { GetLogger } from "@liexp/core/lib/index.js";
import { type ENV } from "#io/ENV.js";

const agentLogger = GetLogger("agent");

export const createMcpClient = (env: ENV): MultiServerMCPClient => {
  const mcpBaseUrl = env.MCP_URL;
  agentLogger.debug.log("Connecting to MCP at:", mcpBaseUrl);
  agentLogger.debug.log(
    "Using API token:",
    env.API_TOKEN ? "***provided***" : "MISSING",
  );

  return new MultiServerMCPClient({
    api: {
      transport: "http",
      url: mcpBaseUrl,
      headers: {
        Authorization: `Bearer ${env.API_TOKEN}`,
      },
      // Enable automatic reconnection when API restarts or session expires.
      // This handles runtime disconnections (e.g., API restarts, session expiry).
      // For initial startup failures, the retryConnect function below provides
      // exponential backoff with more attempts.
      reconnect: {
        enabled: true,
        maxAttempts: 5,
        delayMs: 10_000,
      },
    },
  });
};
