import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import { EventTypes } from "@liexp/shared/lib/io/http/Events/EventType";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { UUID } from "io-ts-types/lib/UUID";
import { Equal } from "typeorm";
import { toDocumentaryIO } from "./documentary.io";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { type Route } from "@routes/route.types";

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
            type: EventTypes.DOCUMENTARY.value,
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
          }),
        ),
        TE.chainEitherK(toDocumentaryIO),
        TE.map((data) => ({
          body: {
            data,
          },
          statusCode: 201,
        })),
      );
    },
  );
};
