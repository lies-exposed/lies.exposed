import { randomUUID } from "node:crypto";
import { authenticationHandler } from "@liexp/backend/lib/express/middleware/auth.middleware.js";
import {
  AdminRead,
  MCPToolsAccess,
} from "@liexp/shared/lib/io/http/auth/permissions/index.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type express from "express";
import { type Route } from "../route.types.js";
import { registerResources } from "./resources/index.js";
import { registerTools } from "./tools/index.js";

export const MakeMCPRoutes: Route = (router, ctx) => {
  // Map to store transports by session ID
  const transports: Record<string, StreamableHTTPServerTransport> = {};

  // Add service client authentication middleware for all environments
  router.use(
    "/mcp",
    authenticationHandler([AdminRead.literals[0], MCPToolsAccess.literals[0]])(
      ctx,
    ),
  );

  // Handle POST requests for client-to-server communication
  router.post("/mcp", async (req, res) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    let transport: StreamableHTTPServerTransport;

    if (sessionId && transports[sessionId]) {
      // Reuse existing transport
      transport = transports[sessionId];
    } else {
      // Create a new transport for this request
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (sessionId) => {
          transports[sessionId] = transport;
        },
      });

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

      await server.connect(transport);
    }

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
