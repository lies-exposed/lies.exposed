import * as t from "io-ts";

export const CoreError = t.strict(
  {
    name: t.string,
    message: t.string,
    status: t.number,
    details: t.union([t.undefined, t.array(t.string)]),
  },
  "APIError"
);

export type CoreError = t.TypeOf<typeof CoreError>;
