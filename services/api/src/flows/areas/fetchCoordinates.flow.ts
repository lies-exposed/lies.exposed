import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type Geometry } from "@liexp/shared/lib/io/http/Common/index.js";
import { type TEFlow } from "#flows/flow.types.js";

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
