import { type GeocodeError } from "@liexp/backend/lib/providers/geocode/geocode.provider.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { type Point } from "@liexp/shared/lib/io/http/Common/Geometry";
import { type Geometry } from "@liexp/shared/lib/io/http/Common/index.js";
import { sequenceS } from "fp-ts/lib/Apply.js";
import { type Option } from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { type Route } from "../route.types.js";
import { toAreaIO } from "./Area.io.js";
import { AreaEntity } from "#entities/Area.entity.js";
import { foldOptionals } from "#utils/foldOptionals.utils.js";

export const MakeEditAreaRoute: Route = (r, { db, geo, logger }) => {
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
              (id) => ({ id }),
            ),
            TE.right,
          ),
          body: TE.right({
            ...foldOptionals({ ...body }),
            media: media.map((id) => ({ id })),
            id,
          }),
        }),
        TE.chain(({ events, geometry, body }) =>
          db.save(AreaEntity, [
            { ...body, geometry, ...(events ? { events } : {}) },
          ]),
        ),
        TE.chain(() =>
          db.findOneOrFail(AreaEntity, {
            where: { id: Equal(id) },
            loadRelationIds: true,
          }),
        ),
        TE.chainEitherK(toAreaIO),
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
