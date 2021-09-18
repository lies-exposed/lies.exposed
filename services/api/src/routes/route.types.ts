import * as logger from "@econnessione/core/logger";
import { Router } from "express";
import { ENV } from "@io/ENV";
import { JWTClient } from "@providers/jwt/JWTClient";
import { DatabaseClient } from "@providers/orm";
import { SpaceClient } from "@providers/space";

export interface RouteContext {
  db: DatabaseClient;
  s3: SpaceClient.SpaceClient;
  env: ENV;
  logger: logger.Logger;
  jwt: JWTClient;
}

export type Route = (r: Router, ctx: RouteContext) => void;
