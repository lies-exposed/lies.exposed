import { AddEndpoint, Endpoints } from "@econnessione/shared/endpoints";
import { ScientificStudyType } from "@econnessione/shared/io/http/Events/ScientificStudy";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { Like } from "typeorm";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { GroupEntity } from "@entities/Group.entity";
import { ServerError } from "@io/ControllerError";
import { toEventV2IO } from "@routes/events/eventV2.io";
import { Route } from "@routes/route.types";

export const MakeCreateScientificStudyFromURLRoute: Route = (
  r,
  { db, logger, urlMetadata }
) => {
  AddEndpoint(r)(
    Endpoints.ScientificStudy.Custom.CreateFromURL,
    ({ body: { url } }) => {
      return pipe(
        db.execQuery(() =>
          db.manager
            .createQueryBuilder(EventV2Entity, "event")
            .where("type = :type", { type: ScientificStudyType.value })
            .where("payload::jsonb ->> 'url' = :url", {
              url,
            })
            .loadAllRelationIds({
              relations: ["media", "keywords", "links"],
            })
            .getOne()
        ),
        TE.chain((existingEvent) => {
          if (!existingEvent) {
            return pipe(
              urlMetadata.fetchMetadata(url, (e) => ServerError()),
              logger.debug.logInTaskEither(`URL metadata %O`),
              TE.chain((meta) =>
                pipe(
                  db.findOne(GroupEntity, {
                    where: { name: Like(`%${meta.provider.toLowerCase()}%`) },
                  }),
                  TE.map((p) => ({
                    ...meta,
                    publisher: pipe(
                      p,
                      O.map((_) => _.id),
                      O.toUndefined
                    ),
                  }))
                )
              ),
              TE.chain((meta) =>
                db.save(EventV2Entity, [
                  {
                    date: new Date(),
                    type: ScientificStudyType.value,
                    excerpt: {},
                    body: {},
                    payload: {
                      title: meta.title,
                      image: meta.image,
                      url,
                      authors: [],
                      publisher: meta.publisher,
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
              )
            );
          }
          return TE.right(existingEvent);
        }),
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
