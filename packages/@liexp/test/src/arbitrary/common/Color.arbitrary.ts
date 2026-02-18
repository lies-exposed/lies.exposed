import { type Color } from "@liexp/io/lib/http/Common/Color.js";
import fc from "fast-check";

export const ColorArb: fc.Arbitrary<Color> = fc
  .tuple(
    fc.integer({ min: 0, max: 255 }),
    fc.integer({ min: 0, max: 255 }),
    fc.integer({ min: 0, max: 255 }),
  )
  .map(
    ([r, g, b]) =>
      `${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}` as Color,
  );
