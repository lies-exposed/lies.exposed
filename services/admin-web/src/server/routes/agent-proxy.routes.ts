import { makeAuditMiddleware } from "@liexp/backend/lib/express/middleware/audit.middleware.js";
import { authenticationHandler } from "@liexp/backend/lib/express/middleware/auth.middleware.js";
import { makeRateLimiter } from "@liexp/backend/lib/express/middleware/rateLimit.factory.js";
import { generateCorrelationId } from "@liexp/backend/lib/utils/correlation.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { ChatRequest } from "@liexp/shared/lib/io/http/Chat.js";
import { AdminRead } from "@liexp/shared/lib/io/http/auth/permissions/index.js";
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

  // Rate limiter (per admin user)
  const chatRateLimiter = makeRateLimiter({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
    getUserKey: (req: any) => {
      const userId = req.user?.id;
      return userId ? `user:${userId}` : undefined;
    },
    logger,
  });

  // Audit middleware (logs all proxy requests)
  const auditMiddleware = makeAuditMiddleware({
    logger,
    getUserContext: (req: any) => ({
      userId: req.user?.id,
      email: req.user?.email,
    }),
  });

  /**
   * POST /api/proxy/agent/chat
   *
   * Proxy chat messages to agent service with M2M authentication.
   * - Requires admin user authentication (AdminRead permission) - TODO: Add auth middleware
   * - Rate limited per user
   * - Audited with correlation ID
   */
  router.post(
    "/chat",
    authenticationHandler([AdminRead.literals[0]])(ctx),
    chatRateLimiter as any,
    auditMiddleware,
    (req: Request, res: Response, next: NextFunction) => {
      const correlationId = generateCorrelationId();

      logger.info.log(
        "Proxying chat request from admin user %s (correlation: %s)",
        (req as any).user?.id,
        correlationId,
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

  // Health check for proxy
  router.get("/health", (_req, res) => {
    res.status(200).json({
      status: "ok",
      service: "admin-proxy",
      timestamp: new Date().toISOString(),
    });
  });
};
