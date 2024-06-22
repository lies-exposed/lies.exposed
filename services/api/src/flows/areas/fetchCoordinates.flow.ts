import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type Geometry } from "@liexp/shared/lib/io/http/Common/index.js";
import { type Option } from "fp-ts/Option";
import { type TEFlow } from "#flows/flow.types.js";

export const fetchCoordinates: TEFlow<[string], Option<Geometry.Point>> =
  (ctx) => (label) => {
    return pipe(
      ctx.geo.search(label),
      fp.TE.map((geo) =>
        pipe(
          fp.O.fromNullable(geo[0]),
          fp.O.map((geo) => ({
            type: "Point" as const,
            coordinates: [+geo.lon, +geo.lat],
          })),
        ),
      ),
    );
  };
