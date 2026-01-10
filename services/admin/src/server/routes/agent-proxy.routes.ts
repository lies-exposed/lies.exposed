import { makeAuditMiddleware } from "@liexp/backend/lib/express/middleware/audit.middleware.js";
import { authenticationHandler } from "@liexp/backend/lib/express/middleware/auth.middleware.js";
import { makeRateLimiter } from "@liexp/backend/lib/express/middleware/rateLimit.factory.js";
import { generateCorrelationId } from "@liexp/backend/lib/utils/correlation.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { AdminRead } from "@liexp/shared/lib/io/http/auth/permissions/index.js";
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
        "Proxying chat request (correlation: %s, user: %s, ip: %s)",
        correlationId,
        req.user?.id ?? "unknown",
        req.ip,
      );

      // Get M2M token
      const getTokenIO = m2m.getToken();

      pipe(
        TE.fromIO(getTokenIO),
        TE.chain(() => {
          logger.debug.log(
            "Calling agent service with M2M token (correlation: %s)",
            correlationId,
          );

          // Call agent service (validation handled by agent)
          return pipe(
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
          );
        }),
        TE.fold(
          (error: unknown) => () => {
            const err = error as { response?: { status?: number } };
            // Map errors to user-friendly messages
            if (err?.response?.status === 401) {
              res.status(500).json({
                error: "Authentication failed",
                message: "Unable to authenticate with agent service",
              });
              return Promise.resolve();
            }

            if (err?.response?.status === 429) {
              res.status(429).json({
                error: "Rate limit exceeded",
                message: "Too many requests to agent service",
              });
              return Promise.resolve();
            }

            if (err?.response?.status && err.response.status >= 500) {
              res.status(503).json({
                error: "Service unavailable",
                message: "Agent service temporarily unavailable",
              });
              return Promise.resolve();
            }

            // Generic error
            res.status(500).json({
              error: "Internal server error",
              message: "Failed to process chat request",
            });

            return Promise.resolve();
          },
          (response) => () => {
            logger.info.log(
              "Chat request successful (correlation: %s)",
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
        "Proxying streaming chat request (correlation: %s, user: %s, ip: %s)",
        correlationId,
        req.user?.id ?? "unknown",
        req.ip,
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
          "Calling agent streaming endpoint with M2M token (correlation: %s)",
          correlationId,
        );

        // Make streaming request to agent service
        const agentUrl = `${env.AGENT_API_URL}/chat/message/stream`;

        const response = await fetch(agentUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "x-correlation-id": correlationId,
          },
          body: JSON.stringify(req.body),
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
          return;
        }

        // Pipe the response body directly to the client response using Web Streams API
        await response.body.pipeTo(
          new WritableStream({
            write(chunk) {
              if (!res.writableEnded) {
                res.write(chunk);

                // Log chunks for debugging
                const chunkStr = new TextDecoder().decode(chunk);
                if (chunkStr.includes("data: ")) {
                  logger.debug.log(
                    "Forwarded SSE event (correlation: %s): %s",
                    correlationId,
                    chunkStr.substring(0, 200),
                  );
                }
              }
            },
            close() {
              logger.info.log(
                "Streaming completed successfully (correlation: %s)",
                correlationId,
              );
              if (!res.writableEnded) {
                res.end();
              }
            },
            abort(err) {
              logger.error.log(
                "Stream aborted: %O (correlation: %s)",
                err,
                correlationId,
              );
              if (!res.writableEnded) {
                res.end();
              }
            },
          }),
        );
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
};
