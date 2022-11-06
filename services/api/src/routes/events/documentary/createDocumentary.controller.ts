import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { DOCUMENTARY } from "@liexp/shared/io/http/Events/Documentary";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { UUID } from "io-ts-types/lib/UUID";
import { Equal } from "typeorm";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { toEventV2IO } from "@routes/events/eventV2.io";
import { Route } from "@routes/route.types";

export const MakeCreateDocumentaryReleaseRoute: Route = (r, { db, logger }) => {
  AddEndpoint(r)(
    Endpoints.DocumentaryEvent.Create,
    ({ body: { payload, ...body } }) => {
      const documentaryData = {
        ...body,
        links: body.links.map((l) => {
          if (UUID.is(l)) {
            return {
              id: l,
            };
          }
          return {
            ...l,
          };
        }),
        media: [{ id: payload.media }],
        keywords: body.keywords.map((l) => ({
          id: l,
        })),
      };

      return pipe(
        db.save(EventV2Entity, [
          {
            type: DOCUMENTARY.value,
            ...documentaryData,
            payload,
          },
        ]),
        TE.chain(([result]) =>
          db.findOneOrFail(EventV2Entity, {
            where: { id: Equal(result.id) },
            loadRelationIds: {
              relations: ["media", "links", "keywords"],
            },
          })
        ),
        TE.chainEitherK(toEventV2IO),
        TE.map((data) => ({
          body: {
            data,
          },
          statusCode: 201,
        }))
      );
    }
  );
};
