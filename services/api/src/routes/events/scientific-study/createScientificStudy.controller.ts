import { AddEndpoint, Endpoints } from "@econnessione/shared/endpoints";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { UUID } from "io-ts-types";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { ServerError } from "@io/ControllerError";
import { toEventV2IO } from "@routes/events/eventV2.io";
import { Route } from "@routes/route.types";

export const MakeCreateScientificStudyRoute: Route = (
  r,
  { db, logger, urlMetadata }
) => {
  AddEndpoint(r)(
    Endpoints.ScientificStudy.Create,
    ({ body: { payload, ...body } }) => {
      const scientificStudyData = {
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
        keywords: body.media.map((l) => {
          if (UUID.is(l)) {
            return {
              id: l,
            };
          }
          return {
            ...l,
          };
        }),
      };

      const scientificStudyPayloadData = payload;

      return pipe(
        urlMetadata.fetchMetadata(payload.url, (e) => ServerError()),
        logger.debug.logInTaskEither(`URL metadata %O`),
        TE.chain((meta) =>
          db.save(EventV2Entity, [
            {
              ...scientificStudyData,
              payload: {
                ...scientificStudyPayloadData,
                title: meta.title ?? scientificStudyPayloadData.title,
              },
            },
          ])
        ),
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
