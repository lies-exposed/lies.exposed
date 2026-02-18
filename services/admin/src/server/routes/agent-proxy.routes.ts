import { makeAuditMiddleware } from "@liexp/backend/lib/express/middleware/audit.middleware.js";
import { authenticationHandler } from "@liexp/backend/lib/express/middleware/auth.middleware.js";
import { makeRateLimiter } from "@liexp/backend/lib/express/middleware/rateLimit.factory.js";
import { generateCorrelationId } from "@liexp/backend/lib/utils/correlation.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { AdminRead } from "@liexp/io/lib/http/auth/permissions/index.js";
import {
  type NextFunction,
  type Request,
  type Response,
  type Router,
} from "express";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type AdminProxyContext } from "../context/index.js";

export const registerAgentProxyRoutes = (
  router: Router,
  ctx: AdminProxyContext,
): void => {
  const { logger, m2m, agent, env } = ctx;

  // Rate limiter (per authenticated user)
  const chatRateLimiter = makeRateLimiter({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
    getUserKey: (req: Request) => {
      const userId = req.user?.id;
      return userId ? `user:${userId}` : req.ip;
    },
    logger,
  });

  // Audit middleware (logs all proxy requests)
  const auditMiddleware = makeAuditMiddleware({
    logger,
    getUserContext: (req: Request) => ({
      userId: req.user?.id,
      email: req.user?.email,
      ip: req.ip,
    }),
  });

  /**
   * POST /api/proxy/agent/chat/message
   *
   * Proxy chat messages to agent service with M2M authentication.
   * - Requires authentication (AdminRead permission)
   * - Rate limited per authenticated user
   * - Audited with correlation ID
   * - Request validation delegated to agent service
   */
  router.post(
    "/chat/message",
    authenticationHandler([AdminRead.literals[0]])(ctx),
    chatRateLimiter,
    auditMiddleware,
    (req: Request, res: Response, next: NextFunction) => {
      const correlationId = generateCorrelationId();

      logger.info.log(
        "Proxying chat request (correlation: %s, user: %s, ip: %s, provider: %s)",
        correlationId,
        req.user?.id ?? "unknown",
        req.ip,
        req.body.aiConfig?.provider ?? "default",
      );

      // Pass request through to agent — let it handle validation
      const proxyToAgent = pipe(
        TE.fromIO(() => m2m.getToken()),
        TE.chain(() =>
          pipe(
            agent.Chat.Create({
              Body: req.body,
            }),
            TE.mapLeft((error) => {
              logger.error.log(
                "Agent service error: %O (correlation: %s)",
                error,
                correlationId,
              );
              return error;
            }),
          ),
        ),
      );

      proxyToAgent()
        .then((result) => {
          if (result._tag === "Left") {
            const error = result.left as any;

            // Handle validation errors
            if (error.message?.includes("Provider")) {
              logger.warn.log(
                "Provider validation failed: %s (correlation: %s)",
                error.message,
                correlationId,
              );
              res.status(400).json({
                error: "Invalid provider configuration",
                message: error.message,
              });
              return;
            }

            // Map errors to user-friendly messages
            if (error?.response?.status === 401) {
              res.status(500).json({
                error: "Authentication failed",
                message: "Unable to authenticate with agent service",
              });
              return;
            }

            if (error?.response?.status === 429) {
              res.status(429).json({
                error: "Rate limit exceeded",
                message: "Too many requests to agent service",
              });
              return;
            }

            if (error?.response?.status && error.response.status >= 500) {
              res.status(503).json({
                error: "Service unavailable",
                message: "Agent service temporarily unavailable",
              });
              return;
            }

            // Generic error
            res.status(500).json({
              error: "Internal server error",
              message: "Failed to process chat request",
            });
            return;
          }

          const response = result.right;
          logger.info.log(
            "Chat request successful (correlation: %s, used provider: %s)",
            correlationId,
            (response as any)?.usedProvider?.provider ?? "default",
          );

          res.status(200).json(response);
        })
        .catch((e) => {
          logger.error.log(
            "Unexpected error in proxy handler: %O (correlation: %s)",
            e,
            correlationId,
          );
          next(e);
        });
    },
  );

  /**
   * GET /api/proxy/agent/chat/conversations
   *
   * List chat conversations
   * - Requires authentication (AdminRead permission)
   * - Rate limited per authenticated user
   */
  router.get(
    "/chat/conversations",
    authenticationHandler([AdminRead.literals[0]])(ctx),
    chatRateLimiter,
    auditMiddleware,
    (req: Request, res: Response, next: NextFunction) => {
      const correlationId = generateCorrelationId();

      logger.info.log(
        "Proxying list conversations request (correlation: %s, user: %s, ip: %s)",
        correlationId,
        req.user?.id ?? "unknown",
        req.ip,
      );

      const getTokenIO = m2m.getToken();

      pipe(
        TE.fromIO(getTokenIO),
        TE.chain(() => {
          return pipe(
            agent.Chat.List({
              Query: {
                limit: req.query.limit as string | undefined,
                offset: req.query.offset as string | undefined,
              },
            }),
            TE.mapLeft((error) => {
              logger.error.log(
                "Agent service error: %O (correlation: %s)",
                error,
                correlationId,
              );
              return error;
            }),
          );
        }),
        TE.fold(
          (_error: unknown) => () => {
            res.status(500).json({
              error: "Internal server error",
              message: "Failed to list conversations",
            });
            return Promise.resolve();
          },
          (response) => () => {
            logger.info.log(
              "List conversations successful (correlation: %s)",
              correlationId,
            );
            res.status(200).json(response);
            return Promise.resolve();
          },
        ),
      )().catch((e) => {
        logger.error.log(
          "Unexpected error in proxy handler: %O (correlation: %s)",
          e,
          correlationId,
        );
        next(e);
      });
    },
  );

  /**
   * GET /api/proxy/agent/chat/conversations/:id
   *
   * Get a specific conversation
   * - Requires authentication (AdminRead permission)
   * - Rate limited per authenticated user
   */
  router.get(
    "/chat/conversations/:id",
    authenticationHandler([AdminRead.literals[0]])(ctx),
    chatRateLimiter,
    auditMiddleware,
    (req: Request, res: Response, next: NextFunction) => {
      const correlationId = generateCorrelationId();
      const { id } = req.params;

      logger.info.log(
        "Proxying get conversation request (correlation: %s, user: %s, ip: %s, id: %s)",
        correlationId,
        req.user?.id ?? "unknown",
        req.ip,
        id,
      );

      const getTokenIO = m2m.getToken();

      pipe(
        TE.fromIO(getTokenIO),
        TE.chain(() => {
          return pipe(
            agent.Chat.Get({
              Params: { id },
            }),
            TE.mapLeft((error) => {
              logger.error.log(
                "Agent service error: %O (correlation: %s)",
                error,
                correlationId,
              );
              return error;
            }),
          );
        }),
        TE.fold(
          (error: unknown) => () => {
            const err = error as { response?: { status?: number } };
            if (err?.response?.status === 404) {
              res.status(404).json({
                error: "Not found",
                message: "Conversation not found",
              });
              return Promise.resolve();
            }
            res.status(500).json({
              error: "Internal server error",
              message: "Failed to get conversation",
            });
            return Promise.resolve();
          },
          (response) => () => {
            logger.info.log(
              "Get conversation successful (correlation: %s)",
              correlationId,
            );
            res.status(200).json(response);
            return Promise.resolve();
          },
        ),
      )().catch((e) => {
        logger.error.log(
          "Unexpected error in proxy handler: %O (correlation: %s)",
          e,
          correlationId,
        );
        next(e);
      });
    },
  );

  /**
   * DELETE /api/proxy/agent/chat/conversations/:id
   *
   * Delete a conversation
   * - Requires authentication (AdminRead permission)
   * - Rate limited per authenticated user
   */
  router.delete(
    "/chat/conversations/:id",
    authenticationHandler([AdminRead.literals[0]])(ctx),
    chatRateLimiter,
    auditMiddleware,
    (req: Request, res: Response, next: NextFunction) => {
      const correlationId = generateCorrelationId();
      const { id } = req.params;

      logger.info.log(
        "Proxying delete conversation request (correlation: %s, user: %s, ip: %s, id: %s)",
        correlationId,
        req.user?.id ?? "unknown",
        req.ip,
        id,
      );

      const getTokenIO = m2m.getToken();

      pipe(
        TE.fromIO(getTokenIO),
        TE.chain(() => {
          return pipe(
            agent.Chat.Delete({
              Params: { id },
            }),
            TE.mapLeft((error) => {
              logger.error.log(
                "Agent service error: %O (correlation: %s)",
                error,
                correlationId,
              );
              return error;
            }),
          );
        }),
        TE.fold(
          (error: unknown) => () => {
            const err = error as { response?: { status?: number } };
            if (err?.response?.status === 404) {
              res.status(404).json({
                error: "Not found",
                message: "Conversation not found",
              });
              return Promise.resolve();
            }
            res.status(500).json({
              error: "Internal server error",
              message: "Failed to delete conversation",
            });
            return Promise.resolve();
          },
          (response) => () => {
            logger.info.log(
              "Delete conversation successful (correlation: %s)",
              correlationId,
            );
            res.status(200).json(response);
            return Promise.resolve();
          },
        ),
      )().catch((e) => {
        logger.error.log(
          "Unexpected error in proxy handler: %O (correlation: %s)",
          e,
          correlationId,
        );
        next(e);
      });
    },
  );

  /**
   * POST /api/proxy/agent/chat/message/stream
   *
   * Proxy streaming chat messages to agent service with M2M authentication.
   * Returns Server-Sent Events (SSE) stream with tool calls and responses.
   * - Requires authentication (AdminRead permission)
   * - Rate limited per authenticated user
   * - Audited with correlation ID
   * - Streams events in real-time to client
   */
  router.post(
    "/chat/message/stream",
    authenticationHandler([AdminRead.literals[0]])(ctx),
    chatRateLimiter,
    auditMiddleware,
    async (req: Request, res: Response) => {
      const correlationId = generateCorrelationId();

      logger.info.log(
        "Proxying streaming chat request (correlation: %s, user: %s, ip: %s, provider: %s)",
        correlationId,
        req.user?.id ?? "unknown",
        req.ip,
        req.body.aiConfig?.provider ?? "default",
      );

      try {
        // Get M2M token
        const token = m2m.getToken()();

        // Set headers for Server-Sent Events
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.setHeader("X-Accel-Buffering", "no");

        // Send initial comment to establish connection
        res.write(": proxy connected\n\n");

        // Handle client disconnect
        req.on("close", () => {
          logger.info.log(
            "Client disconnected, cleaning up stream (correlation: %s)",
            correlationId,
          );
        });

        logger.debug.log(
          "Calling agent streaming endpoint with M2M token (correlation: %s, provider: %s)",
          correlationId,
          aiConfig?.provider ?? "default",
        );

        // Make streaming request to agent service
        const agentUrl = `${env.AGENT_API_URL}/chat/message/stream`;

        // Set up abort controller with 5-minute timeout for streaming responses.
        // LocalAI on CPU can take several minutes for prompt processing alone.
        const abortController = new AbortController();
        const timeoutId = setTimeout(
          () => {
            logger.warn.log(
              "Streaming request timeout after 5 minutes (correlation: %s)",
              correlationId,
            );
            abortController.abort();
          },
          300000, // 5 minutes
        );

        const response = await fetch(agentUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "x-correlation-id": correlationId,
          },
          body: JSON.stringify(req.body),
          signal: abortController.signal,
        });

        if (!response.ok) {
          logger.error.log(
            "Agent streaming request failed: %d (correlation: %s)",
            response.status,
            correlationId,
          );

          res.write(
            `data: ${JSON.stringify({
              type: "error",
              timestamp: new Date().toISOString(),
              error: `Agent service returned ${response.status}`,
            })}\n\n`,
          );
          res.end();
          clearTimeout(timeoutId);
          return;
        }

        if (!response.body) {
          logger.error.log(
            "Agent response has no body (correlation: %s)",
            correlationId,
          );
          res.write(
            `data: ${JSON.stringify({
              type: "error",
              timestamp: new Date().toISOString(),
              error: "No response body from agent service",
            })}\n\n`,
          );
          res.end();
          clearTimeout(timeoutId);
          return;
        }

        // Flush headers immediately to establish the SSE connection
        res.flushHeaders();

        // Read from agent stream using getReader() for explicit flow control,
        // allowing keepalive writes to interleave properly
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let keepaliveInterval: NodeJS.Timeout | null = null;
        let streamDone = false;

        // Helper to write and flush — ensures data reaches the client immediately
        const writeAndFlush = (data: string | Uint8Array): boolean => {
          if (res.writableEnded) return false;
          res.write(data);
          // flush() is added by compression middleware to force-flush buffered data
          if (typeof (res as any).flush === "function") {
            (res as any).flush();
          }
          return true;
        };

        try {
          // Keepalive timer to prevent socket/proxy timeouts during long waits
          keepaliveInterval = setInterval(() => {
            if (!streamDone && !res.writableEnded) {
              writeAndFlush(": keepalive\n\n");
              logger.debug.log(
                "Sent keepalive comment to client (correlation: %s)",
                correlationId,
              );
            }
          }, 15000); // Every 15 seconds (well within typical 60s proxy timeouts)

          // Read loop — pull chunks from agent and forward to client
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              logger.info.log(
                "Streaming completed successfully (correlation: %s)",
                correlationId,
              );
              break;
            }

            if (!writeAndFlush(value)) {
              logger.warn.log(
                "Client disconnected during streaming (correlation: %s)",
                correlationId,
              );
              break;
            }

            // Log forwarded events for debugging
            const chunkStr = decoder.decode(value, { stream: true });
            if (chunkStr.includes("data: ")) {
              logger.debug.log(
                "Forwarded SSE event (correlation: %s): %s",
                correlationId,
                chunkStr.substring(0, 200),
              );
            }
          }
        } finally {
          streamDone = true;
          if (keepaliveInterval) {
            clearInterval(keepaliveInterval);
          }
          clearTimeout(timeoutId);
          reader.releaseLock();
          if (!res.writableEnded) {
            res.end();
          }
        }
      } catch (error) {
        logger.error.log(
          "Streaming proxy error: %O (correlation: %s)",
          error,
          correlationId,
        );

        // Send error event if possible
        if (!res.headersSent) {
          res.status(500).json({
            error: "Streaming failed",
            message: error instanceof Error ? error.message : "Unknown error",
          });
        } else {
          res.write(
            `data: ${JSON.stringify({
              type: "error",
              timestamp: new Date().toISOString(),
              error: error instanceof Error ? error.message : "Unknown error",
            })}\n\n`,
          );
          res.end();
        }
      }
    },
  );

  // Health check for proxy
  router.get("/health", (_req, res) => {
    res.status(200).json({
      status: "ok",
      service: "admin-proxy",
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * GET /api/proxy/agent/providers
   *
   * Proxy provider listing to agent service.
   * The agent is the source of truth for available providers/models.
   * - Requires authentication (AdminRead permission)
   */
  router.get(
    "/providers",
    authenticationHandler([AdminRead.literals[0]])(ctx),
    (req: Request, res: Response, next: NextFunction) => {
      const correlationId = generateCorrelationId();

      logger.info.log(
        "Proxying providers list request (correlation: %s, user: %s)",
        correlationId,
        req.user?.id ?? "unknown",
      );

      pipe(
        TE.fromIO(() => m2m.getToken()),
        TE.chain(() =>
          pipe(
            agent.Chat.Custom.ListProviders({}),
            TE.mapLeft((error) => {
              logger.error.log(
                "Agent service error fetching providers: %O (correlation: %s)",
                error,
                correlationId,
              );
              return error;
            }),
          ),
        ),
        TE.fold(
          (_error: unknown) => () => {
            res.status(500).json({
              error: "Internal server error",
              message: "Failed to fetch providers from agent",
            });
            return Promise.resolve();
          },
          (response) => () => {
            logger.info.log(
              "Providers list successful (correlation: %s)",
              correlationId,
            );
            res.status(200).json(response);
            return Promise.resolve();
          },
        ),
      )().catch((e) => {
        logger.error.log(
          "Unexpected error in providers proxy: %O (correlation: %s)",
          e,
          correlationId,
        );
        next(e);
      });
    },
  );
};
