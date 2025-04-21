import { Schema } from "effect";
import { UUID } from "./UUID.js";

export const BaseProps = Schema.Struct({
  id: UUID,
  // type: Schema.String,
  createdAt: Schema.Date,
  updatedAt: Schema.Date,
  deletedAt: Schema.Union(Schema.Date, Schema.Null, Schema.Undefined),
}).annotations({ title: "BaseProps" });

export type BaseProps = typeof BaseProps.Type;
