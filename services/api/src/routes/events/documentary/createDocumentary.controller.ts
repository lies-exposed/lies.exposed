import { EventV2Entity } from "@entities/Event.v2.entity";
import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { DOCUMENTARY } from '@liexp/shared/io/http/Events/Documentary';
import { toEventV2IO } from "@routes/events/eventV2.io";
import { Route } from "@routes/route.types";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { UUID } from "io-ts-types";

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
        media: body.media.map((l) => {
          if (UUID.is(l)) {
            return {
              id: l,
            };
          }
          return {
            ...l,
          };
        }),
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
            where: { id: result.id },
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
