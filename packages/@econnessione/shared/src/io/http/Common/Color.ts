import * as t from "io-ts";

export const Color = t.brand(
  t.string,
  (s): s is t.Branded<string, { readonly ColorType: symbol }> =>
    s.length === 7 || s.length === 6,
  "ColorType"
);

export type Color = t.TypeOf<typeof Color>;
