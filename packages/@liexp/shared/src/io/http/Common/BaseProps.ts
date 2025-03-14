import { Schema } from "effect";
import { UUID } from "./UUID.js";

export const BaseProps = Schema.Struct({
  id: UUID,
  // type: Schema.String,
  createdAt: Schema.DateFromString,
  updatedAt: Schema.DateFromString,
  deletedAt: Schema.Union(Schema.DateFromString, Schema.Null, Schema.Undefined),
}).annotations({ title: "BaseProps" });

export type BaseProps = typeof BaseProps.Type;
