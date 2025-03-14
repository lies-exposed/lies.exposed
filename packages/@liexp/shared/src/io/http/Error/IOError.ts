import { Schema } from "effect";
import { type DecodingError, type CommunicationError } from "ts-io-error";

export const IOErrorSchema = Schema.Struct({
  name: Schema.String,
  status: Schema.Number,
  details: Schema.Union(
    Schema.Struct({
      kind: Schema.Literal("DecodingError" as DecodingError),
      errors: Schema.Array(Schema.Unknown),
      status: Schema.String,
    }),
    Schema.Struct({
      kind: Schema.Union(
        Schema.Literal("ClientError" as CommunicationError),
        Schema.Literal("ServerError" as CommunicationError),
        Schema.Literal("NetworkError" as CommunicationError),
      ),
      meta: Schema.Union(Schema.Unknown, Schema.Undefined),
      status: Schema.String,
    }),
  ),
}).annotations({
  title: "IOError",
});

export type IOErrorSchema = typeof IOErrorSchema.Type;
