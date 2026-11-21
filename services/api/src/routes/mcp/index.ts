import { authenticationHandler } from "@liexp/backend/lib/express/middleware/auth.middleware.js";
import { Sentry } from "@liexp/backend/lib/providers/sentry.provider.js";
import { type AuthUser } from "@liexp/io/lib/http/auth/AuthUser.js";
import {
  AdminRead,
  MCPToolsAccess,
} from "@liexp/io/lib/http/auth/permissions/index.js";
import { type AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type express from "express";
import { type Route } from "../route.types.js";
import { registerResources } from "./resources/index.js";
import { registerTools } from "./tools/index.js";

export const MakeMCPRoutes: Route = (router, ctx) => {
  // The MCP endpoint is stateless: every POST gets its own server + transport.
  // The tools hold no per-session state, and in-memory sessions broke clients
  // (e.g. the agent) every time the API restarted or scaled past one replica:
  // their cached `mcp-session-id` became invalid ("Server not initialized").
  // Any `mcp-session-id` header sent by a client is simply ignored.

  // Add service client authentication middleware for all environments
  if (ctx.env.NODE_ENV !== "development") {
    router.use(
      "/mcp",
      authenticationHandler([
        AdminRead.literals[0],
        MCPToolsAccess.literals[0],
      ])(ctx),
    );
  }

  // Handle POST requests for client-to-server communication
  router.post("/mcp", async (req, res) => {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });

    const server = new McpServer({
      name: "lies-exposed",
      version: "1.0.0",
    });

    registerResources(server, ctx);
    registerTools(server, ctx);

    res.on("close", () => {
      void transport.close();
      void server.close();
    });

    await server.connect(transport);

    // Expose the authenticated identity to tool handlers via `extra.authInfo`
    // so that created entities can be attributed to the caller.
    const authUser = (req as express.Request & { user?: AuthUser }).user;
    if (authUser) {
      (req as express.Request & { auth?: AuthInfo }).auth = {
        token: "",
        clientId: authUser.id,
        scopes: [...authUser.permissions],
        extra: { userId: authUser.id },
      };
    }

    try {
      await transport.handleRequest(req, res, req.body);
    } catch (err) {
      // Report MCP errors to Sentry before handling them.
      if (Sentry.isInitialized()) {
        Sentry.captureException(err, {
          tags: { feature: "mcp" },
          fingerprint: ["mcp", err instanceof Error ? err.name : "unknown"],
        });
      }

      // If the SDK didn't already send a response, return a JSON-RPC error.
      if (!res.writableEnded) {
        const message = err instanceof Error ? err.message : "Unknown error";
        res.status(200).json({
          jsonrpc: "2.0",
          id: (req.body as { id?: number })?.id ?? null,
          error: { code: -32603, message },
        });
      }
      // If the SDK already sent a response (e.g. 500 Express error),
      // log the error but don't try to send another response.
      else {
        ctx.logger.error.log(
          "MCP transport error (response already sent):",
          err instanceof Error ? err.message : String(err),
        );
      }
    }
  });

  // No sessions: server-to-client SSE streams and session termination are not
  // supported in stateless mode.
  const methodNotAllowed = (_req: express.Request, res: express.Response) => {
    res
      .status(405)
      .set("Allow", "POST")
      .json({
        jsonrpc: "2.0",
        error: { code: -32000, message: "Method not allowed." },
        id: null,
      });
  };

  router.get("/mcp", methodNotAllowed);
  router.delete("/mcp", methodNotAllowed);
};
