import { fp } from "@liexp/core/lib/fp/index.js";
import { type NextFunction, type Request, type Response } from "express";
import { type ServerContext } from "#context/context.type.js";

/**
 * Middleware for API key authentication (machine-to-machine)
 * Checks for Bearer token in Authorization header and validates against API_TOKEN
 */
export const apiKeyMiddleware = (ctx: ServerContext) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Missing or invalid Authorization header",
      });
      return;
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    const client = ctx.jwt.verifyClient(token)();
    if (fp.E.isLeft(client)) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Invalid API token",
      });
      return;
    }

    // Add machine user info to request for downstream use
    (req as Request & { user?: any }).user = {
      id: client.right.id,
      type: "machine",
      scopes: ["machine-to-machine"],
      permissions: client.right.permissions,
    };

    next();
  };
};
