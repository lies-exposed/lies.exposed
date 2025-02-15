import { type Color } from "@liexp/shared/lib/io/http/Common/Color.js";
import fc from "fast-check";

export const ColorArb: fc.Arbitrary<Color> = fc.hexaString({
  maxLength: 6,
  minLength: 6,
}) as fc.Arbitrary<any>;
// .chain((color) => fc.constant(`#${color}`))
