import * as t from "io-ts";

export const CoreError = t.strict(
  {
    name: t.string,
    message: t.string,
    details: t.union([t.undefined, t.array(t.string)]),
  },
  "CoreError",
);

export type CoreError = t.TypeOf<typeof CoreError>;
