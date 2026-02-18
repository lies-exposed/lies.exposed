import { errorHandler } from "@liexp/backend/lib/express/middleware/error.middleware.js";
import cors from "cors";
import express from "express";
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

  app.use(errorHandler(ctx));

  return app;
};
