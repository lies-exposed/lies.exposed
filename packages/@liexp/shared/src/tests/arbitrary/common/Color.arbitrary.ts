import { fc } from "@liexp/test";
import { type Color } from "../../../io/http/Common/Color.js";

export const ColorArb: fc.Arbitrary<Color> = fc.hexaString({
  maxLength: 6,
  minLength: 6,
}) as fc.Arbitrary<any>;
// .chain((color) => fc.constant(`#${color}`))
