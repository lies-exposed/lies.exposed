import { type GeocodeError } from "@liexp/backend/lib/providers/geocode/geocode.provider.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { type Point } from "@liexp/shared/lib/io/http/Common/Geometry/index.js";
import { type Geometry } from "@liexp/shared/lib/io/http/Common/index.js";
import { sequenceS } from "fp-ts/Apply";
import { type Option } from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { Equal } from "typeorm";
import { type Route } from "../route.types.js";
import { toAreaIO } from "./Area.io.js";
import { AreaEntity } from "#entities/Area.entity.js";
import { foldOptionals } from "#utils/foldOptionals.utils.js";

export const MakeEditAreaRoute: Route = (r, { db, geo, env, logger }) => {
  AddEndpoint(r)(
    Endpoints.Area.Edit,
    ({ params: { id }, body: { media, events, updateGeometry, ...body } }) => {
      logger.debug.log("Area update data %O", { ...body, media });

      const getGeometry = pipe(
        updateGeometry,
        fp.O.filter((a) => a),
        fp.O.chain(() => body.label),
        fp.O.fold(
          () =>
            TE.right<GeocodeError, Option<Geometry.Geometry>>(body.geometry),
          (label) =>
            pipe(
              geo.search(label),
              fp.TE.map(([g]) =>
                fp.O.some<Point>({
                  type: "Point",
                  coordinates: [+g.lon, +g.lat],
                }),
              ),
            ),
        ),
        fp.TE.map(fp.O.toUndefined),
      );

      return pipe(
        sequenceS(TE.ApplicativePar)({
          geometry: getGeometry,
          events: pipe(
            events,
            fp.O.fold(
              () => undefined,
              (ids) => ids.map((id) => ({ id })),
            ),
            TE.right,
          ),
          body: TE.right({
            ...foldOptionals({ ...body }),
            media: media.map((id) => ({ id })),
            id,
          }),
        }),
        TE.chain(({ events, geometry, body: { featuredImage, ...body } }) =>
          db.save(AreaEntity, [
            {
              ...body,
              featuredImage: featuredImage ? { id: featuredImage } : null,
              geometry,
              ...(events ? { events } : {}),
            },
          ]),
        ),
        TE.chain(() =>
          db.findOneOrFail(AreaEntity, {
            where: { id: Equal(id) },
            loadRelationIds: {
              relations: ["media", "events"],
            },
            relations: {
              featuredImage: true,
            },
          }),
        ),
        TE.chainEitherK((a) => toAreaIO(a, env.SPACE_ENDPOINT)),
        TE.map((page) => ({
          body: {
            data: page,
          },
          statusCode: 200,
        })),
      );
    },
  );
};
