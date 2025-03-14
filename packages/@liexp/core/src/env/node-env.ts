import { Schema } from "effect";

const DEVELOPMENT = Schema.Literal("development");
const PRODUCTION = Schema.Literal("production");

export const NODE_ENV = Schema.Union(
  DEVELOPMENT,
  Schema.Literal("test"),
  PRODUCTION,
).annotations({
  title: "NODE_ENV",
});
export type NODE_ENV = typeof NODE_ENV.Type;
