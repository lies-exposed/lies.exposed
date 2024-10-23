import * as t from "io-ts";
import { type DecodingError, type CommunicationError } from "ts-io-error";

export const IOErrorSchema = t.strict(
  {
    name: t.string,
    status: t.number,
    details: t.union([
      t.type({
        kind: t.literal<DecodingError>("DecodingError"),
        errors: t.array(t.unknown),
        status: t.string,
      }),
      t.type({
        kind: t.union([
          t.literal<CommunicationError>("ClientError"),
          t.literal<CommunicationError>("ServerError"),
          t.literal<CommunicationError>("NetworkError"),
        ]),
        meta: t.union([t.unknown, t.undefined]),
        status: t.string,
      }),
    ]),
  },
  "IOError",
);

export type IOErrorSchema = t.TypeOf<typeof IOErrorSchema>;
