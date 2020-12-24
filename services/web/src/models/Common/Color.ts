import * as t from "io-ts"

export const Color = new t.Type(
  "ColorType",
  t.string.is,
  t.string.validate,
  t.string.encode
)

export type Color = t.TypeOf<typeof Color>
