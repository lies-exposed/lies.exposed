import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { DocumentaryIO } from "@liexp/backend/lib/io/event/documentary.io.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { EVENT_TYPES } from "@liexp/shared/lib/io/http/Events/EventType.js";
import { Schema } from "effect";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

export const MakeCreateDocumentaryReleaseRoute: Route = (r, { db, logger }) => {
  AddEndpoint(r)(
    Endpoints.DocumentaryEvent.Create,
    ({ body: { payload, ...body } }) => {
      const documentaryData = {
        ...body,
        links: body.links.map((l) => {
          if (Schema.is(UUID)(l)) {
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
            type: EVENT_TYPES.DOCUMENTARY,
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
        TE.chainEitherK(DocumentaryIO.decodeSingle),
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
