import { Schema } from "effect";
import { CoreError } from "./CoreError.js";

export const APIStatusCode = Schema.Union(
  Schema.Literal(200),
  Schema.Literal(201),
  Schema.Literal(400),
  Schema.Literal(401),
  Schema.Literal(403),
  Schema.Literal(404),
  Schema.Literal(500),
).annotations({
  title: "StatusCode",
});

export type APIStatusCode = typeof APIStatusCode.Type;

export const APIError = Schema.Struct({
  ...CoreError.fields,
  status: APIStatusCode,
  name: Schema.Literal("APIError"),
}).annotations({
  title: "APIError",
});

export type APIError = typeof APIError.Type;
