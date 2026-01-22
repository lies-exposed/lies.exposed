import cors from "cors";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { type AgentContext } from "../context/context.type.js";
import { createRoutes } from "../routes/index.js";

export const makeApp = <C extends AgentContext>(ctx: C): express.Express => {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Authentication is handled per-route using authenticationHandler middleware
  // This allows for fine-grained permission control and supports both User and ServiceClient tokens

  // Routes
  app.use("/v1", createRoutes(ctx));

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    ctx.logger.error.log("Express error: %O", err);

    // Try to extract a status code from known error shapes
    let status = 500;

    // Common patterns: err.status (string|number), err.options?.status, err.meta?.status
    if (typeof err.status === "number") {
      status = err.status;
    } else if (
      typeof err.status === "string" &&
      !Number.isNaN(Number(err.status))
    ) {
      status = Number(err.status);
    } else if (err?.options?.status) {
      const s = err.options.status;
      status = typeof s === "string" ? Number(s) : Number(s ?? 500);
    } else if (err?.meta?.status) {
      const s = err.meta.status;
      status = typeof s === "string" ? Number(s) : Number(s ?? 500);
    } else if (err?.name === "JWTError" || err?.name === "NotAuthorizedError") {
      status = 401;
    }

    res.status(status).json({
      error: status >= 500 ? "Internal server error" : "Unauthorized",
      message: err.message,
      details: "details" in err ? err.details : undefined,
    });
  });

  return app;
};
