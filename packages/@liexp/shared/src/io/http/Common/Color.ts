import * as t from "io-ts";

export const Color = t.brand(
  t.string,
  (s): s is t.Branded<string, { readonly ColorType: symbol }> =>
    s.length === 6 && !s.includes("#"),
  "ColorType"
);

export type Color = t.TypeOf<typeof Color>;

export const toColor = (s: string): Color =>
  (s.startsWith("#") ? s.replace("#", "") : s) as any as Color;
