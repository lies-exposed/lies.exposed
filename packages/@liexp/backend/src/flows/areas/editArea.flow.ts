import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type Area, type EditAreaBody } from "@liexp/shared/lib/io/http/Area.js";
import { type UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { type Geometry } from "@liexp/shared/lib/io/http/Common/index.js";
import { sequenceS } from "fp-ts/lib/Apply.js";
import { type Option } from "fp-ts/lib/Option.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import * as RTE from "fp-ts/lib/ReaderTaskEither.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { type DatabaseContext } from "../../context/db.context.js";
import { type GeocodeProviderContext } from "../../context/index.js";
import { AreaIO } from "../../io/Area.io.js";
import { type GeocodeError } from "../../providers/geocode/geocode.provider.js";
import { type DBError } from "../../providers/orm/database.provider.js";
import { AreaRepository } from "../../services/entity-repository.service.js";
import { foldOptionals } from "../../utils/foldOptionals.utils.js";
import { fetchCoordinates } from "../geo/fetchCoordinates.flow.js";

interface EditAreaInput extends EditAreaBody {
  id: UUID;
}

export const editArea = <C extends DatabaseContext & GeocodeProviderContext>(
  input: EditAreaInput,
): ReaderTaskEither<C, DBError | GeocodeError, Area> => {
  const { id, media, events, updateGeometry, ...body } = input;

  return pipe(
    RTE.ask<C>(),
    RTE.chain(({ geo }) => {
      const getGeometry = pipe(
        updateGeometry,
        fp.O.filter((a) => a),
        fp.O.chain(() => body.label),
        fp.O.fold(
          () =>
            TE.right<GeocodeError, Option<Geometry.Geometry>>(body.geometry),
          (label) => fetchCoordinates(label)({ geo }),
        ),
        fp.TE.map(fp.O.toUndefined),
      );

      return pipe(
        () =>
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
        fp.RTE.chain(({ events, geometry, body: { featuredImage, ...body } }) =>
          AreaRepository.save<C>([
            {
              ...body,
              featuredImage: featuredImage ? { id: featuredImage } : null,
              geometry,
              ...(events ? { events } : {}),
            },
          ]),
        ),
        fp.RTE.chain(() =>
          AreaRepository.findOneOrFail<C>({
            where: { id: Equal(id) },
            loadRelationIds: {
              relations: ["media", "events"],
            },
            relations: {
              featuredImage: true,
            },
          }),
        ),
        fp.RTE.chainEitherK((a) => AreaIO.decodeSingle(a)),
      );
    }),
  );
};
