import { randomUUID } from "node:crypto";
import { authenticationHandler } from "@liexp/backend/lib/express/middleware/auth.middleware.js";
import {
  AdminRead,
  MCPToolsAccess,
} from "@liexp/shared/lib/io/http/auth/permissions/index.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import type express from "express";
import { type Route } from "../route.types.js";
import { registerResources } from "./resources/index.js";
import { registerTools } from "./tools/index.js";

export const MakeMCPRoutes: Route = (router, ctx) => {
  // Map to store transports by session ID
  const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

  // Add service client authentication middleware for all environments
  router.use(
    "/mcp",
    authenticationHandler([AdminRead.literals[0], MCPToolsAccess.literals[0]])(
      ctx,
    ),
  );

  // Handle POST requests for client-to-server communication
  router.post("/mcp", async (req, res) => {
    // Check for existing session ID
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    let transport: StreamableHTTPServerTransport;

    if (sessionId && transports[sessionId]) {
      // Reuse existing transport
      transport = transports[sessionId];
    } else if (!sessionId && isInitializeRequest(req.body)) {
      // New initialization request
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (sessionId) => {
          // Store the transport by session ID
          transports[sessionId] = transport;
        },
        // DNS rebinding protection is disabled by default for backwards compatibility. If you are running this server
        // locally, make sure to set:
        // enableDnsRebindingProtection: true,
        // allowedHosts: ['127.0.0.1'],
      });

      // Clean up transport when closed
      transport.onclose = () => {
        if (transport.sessionId) {
          delete transports[transport.sessionId];
        }
      };
      const server = new McpServer({
        name: "lies-exposed",
        version: "1.0.0",
      });

      registerResources(server, ctx);
      registerTools(server, ctx);

      // Connect to the MCP server
      await server.connect(transport);
    } else {
      // Invalid request
      res.status(400).json({
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: "Bad Request: No valid session ID provided",
        },
        id: null,
      });
      return;
    }

    // Handle the request
    await transport.handleRequest(req, res, req.body);
  });

  // Reusable handler for GET and DELETE requests
  const handleSessionRequest = async (
    req: express.Request,
    res: express.Response,
  ) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    if (!sessionId || !transports[sessionId]) {
      res.status(400).send("Invalid or missing session ID");
      return;
    }

    const transport = transports[sessionId];
    await transport.handleRequest(req, res);
  };

  // Handle GET requests for server-to-client notifications via SSE
  router.get("/mcp", handleSessionRequest);

  // Handle DELETE requests for session termination
  router.delete("/mcp", handleSessionRequest);
};
