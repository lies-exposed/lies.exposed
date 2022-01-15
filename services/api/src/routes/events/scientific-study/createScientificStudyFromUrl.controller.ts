import { AddEndpoint, Endpoints } from "@econnessione/shared/endpoints";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { ServerError } from "@io/ControllerError";
import { toEventV2IO } from "@routes/events/eventV2.io";
import { Route } from "@routes/route.types";

export const MakeCreateScientificStudyFromURLRoute: Route = (
  r,
  { db, logger, urlMetadata }
) => {
  AddEndpoint(r)(
    Endpoints.ScientificStudy.Custom.CreateFromURL,
    ({ body: { url, date } }) => {
      return pipe(
        urlMetadata.fetchMetadata(url, (e) => ServerError()),
        logger.debug.logInTaskEither(`URL metadata %O`),
        TE.chain((meta) =>
          db.save(EventV2Entity, [
            {
              date,
              payload: {
                title: meta.title,
                url,
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
