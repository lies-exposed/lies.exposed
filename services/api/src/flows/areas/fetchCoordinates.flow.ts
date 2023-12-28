import { fp } from "@liexp/core/lib/fp";
import { type Geometry } from "@liexp/shared/lib/io/http/Common";
import { pipe } from "fp-ts/lib/function";
import { type TEFlow } from "#flows/flow.types";

export const fetchCoordinates: TEFlow<[string], Geometry.Point> =
  (ctx) => (label) => {
    return pipe(
      ctx.geo.search(label),
      fp.TE.map((geo) => ({
        type: "Point" as const,
        coordinates: [+geo[0].lon, +geo[0].lat],
      })),
    );
  };
