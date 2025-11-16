import { makeAuditMiddleware } from "@liexp/backend/lib/express/middleware/audit.middleware.js";
import { makeRateLimiter } from "@liexp/backend/lib/express/middleware/rateLimit.factory.js";
import { generateCorrelationId } from "@liexp/backend/lib/utils/correlation.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { ChatRequest } from "@liexp/shared/lib/io/http/Chat.js";
import { Schema } from "effect";
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

  // Rate limiter (per IP address until auth is implemented)
  const chatRateLimiter = makeRateLimiter({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
    getUserKey: (req: Request) => {
      // TODO: Use user ID once authentication is implemented
      // const userId = req.user?.id;
      // return userId ? `user:${userId}` : undefined;
      return req.ip;
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
   * - Rate limited per user
   * - Audited with correlation ID
   * - TODO: Add authentication middleware once implemented in @liexp/backend
   */
  router.post(
    "/chat/message",
    // TODO: Re-enable authentication when authenticationHandler is available
    // authenticationHandler([AdminRead.literals[0]])(ctx),
    chatRateLimiter,
    auditMiddleware,
    (req: Request, res: Response, next: NextFunction) => {
      const correlationId = generateCorrelationId();

      logger.info.log(
        "Proxying chat request (correlation: %s, ip: %s)",
        correlationId,
        req.ip,
      );

      // Validate request body
      const decodeResult = Schema.decodeUnknownEither(ChatRequest)(req.body);

      if (decodeResult._tag === "Left") {
        logger.warn.log("Invalid chat request: %O", decodeResult.left);
        res.status(400).json({
          error: "Invalid request",
          message: "Request body does not match ChatRequest schema",
        });
        return;
      }

      const chatRequest = decodeResult.right;

      // Get M2M token
      const getTokenIO = m2m.getToken();

      pipe(
        TE.fromIO(getTokenIO),
        TE.chain(() => {
          logger.debug.log(
            "Calling agent service with M2M token (correlation: %s)",
            correlationId,
          );

          // Call agent service
          return pipe(
            agent.Chat.Create({
              Body: chatRequest,
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
          (error: any) => () => {
            // Map errors to user-friendly messages
            if (error?.response?.status === 401) {
              res.status(500).json({
                error: "Authentication failed",
                message: "Unable to authenticate with agent service",
              });
              return Promise.resolve();
            }

            if (error?.response?.status === 429) {
              res.status(429).json({
                error: "Rate limit exceeded",
                message: "Too many requests to agent service",
              });
              return Promise.resolve();
            }

            if (error?.response?.status >= 500) {
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
   */
  router.get(
    "/chat/conversations",
    chatRateLimiter,
    auditMiddleware,
    (req: Request, res: Response, next: NextFunction) => {
      const correlationId = generateCorrelationId();

      logger.info.log(
        "Proxying list conversations request (correlation: %s, ip: %s)",
        correlationId,
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
   */
  router.get(
    "/chat/conversations/:id",
    chatRateLimiter,
    auditMiddleware,
    (req: Request, res: Response, next: NextFunction) => {
      const correlationId = generateCorrelationId();
      const { id } = req.params;

      logger.info.log(
        "Proxying get conversation request (correlation: %s, ip: %s, id: %s)",
        correlationId,
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
          (error: any) => () => {
            if (error?.response?.status === 404) {
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
   */
  router.delete(
    "/chat/conversations/:id",
    chatRateLimiter,
    auditMiddleware,
    (req: Request, res: Response, next: NextFunction) => {
      const correlationId = generateCorrelationId();
      const { id } = req.params;

      logger.info.log(
        "Proxying delete conversation request (correlation: %s, ip: %s, id: %s)",
        correlationId,
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

  // Health check for proxy
  router.get("/health", (_req, res) => {
    res.status(200).json({
      status: "ok",
      service: "admin-proxy",
      timestamp: new Date().toISOString(),
    });
  });
};
