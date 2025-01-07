import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type Geometry } from "@liexp/shared/lib/io/http/Common/index.js";
import { type Option } from "fp-ts/lib/Option.js";
import { type TaskEither } from "fp-ts/lib/TaskEither.js";
import { type GeocodeProviderContext } from "../../context/index.js";
import { type GeocodeError } from "../../providers/geocode/geocode.provider.js";

export const fetchCoordinates =
  (label: string) =>
  <C extends GeocodeProviderContext>(
    ctx: C,
  ): TaskEither<GeocodeError, Option<Geometry.Point>> => {
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
