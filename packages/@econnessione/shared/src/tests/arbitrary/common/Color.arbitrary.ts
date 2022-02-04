import { fc } from "@econnessione/core/tests";
import { Color } from "../../../io/http/Common/Color";

export const ColorArb: fc.Arbitrary<Color> = fc.hexaString({
  maxLength: 6,
  minLength: 6,
}) as fc.Arbitrary<any>;
// .chain((color) => fc.constant(`#${color}`))
