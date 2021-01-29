import { logger } from '@econnessione/core';
import { ENV } from "@io/ENV";
import { MDXClient } from "@providers/mdx";
import { DatabaseClient } from "@providers/orm";
import { SpaceClient } from "@providers/space";
import { Router } from "express";

export interface RouteContext {
  db: DatabaseClient;
  s3: SpaceClient.SpaceClient;
  mdx: MDXClient;
  env: ENV;
  logger: logger.Logger
}

export type Route = (r: Router, ctx: RouteContext) => void;
