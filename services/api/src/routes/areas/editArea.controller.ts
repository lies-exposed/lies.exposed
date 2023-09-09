import { type GeocodeError } from "@liexp/backend/lib/providers/geocode/geocode.provider";
import { fp } from "@liexp/core/lib/fp";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import { type Geometry } from "@liexp/shared/lib/io/http/Common";
import { type Point } from "@liexp/shared/lib/io/http/Common/Geometry";
import { sequenceS } from "fp-ts/Apply";
import { type Option } from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { Equal } from "typeorm";
import { type Route } from "../route.types";
import { toAreaIO } from "./Area.io";
import { AreaEntity } from "@entities/Area.entity";
import { foldOptionals } from "@utils/foldOptionals.utils";

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
