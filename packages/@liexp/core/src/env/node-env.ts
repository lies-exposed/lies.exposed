import * as t from "io-ts";

const DEVELOPMENT = t.literal("development");
const PRODUCTION = t.literal("production");
export const NODE_ENV = t.union(
  [DEVELOPMENT, t.literal("test"), PRODUCTION],
  "NODE_ENV",
);
