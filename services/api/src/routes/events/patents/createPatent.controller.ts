import { ActorEntity } from "@liexp/backend/lib/entities/Actor.entity.js";
import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { GroupEntity } from "@liexp/backend/lib/entities/Group.entity.js";
import { LinkEntity } from "@liexp/backend/lib/entities/Link.entity.js";
import { PatentIO } from "@liexp/backend/lib/io/event/patent.io.js";
import { createEventQuery } from "@liexp/backend/lib/queries/events/createEvent.query.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { EVENT_TYPES } from "@liexp/shared/lib/io/http/Events/EventType.js";
import { sequenceS } from "fp-ts/lib/Apply.js";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal, In } from "typeorm";
import { type Route } from "../../route.types.js";
import { type ControllerError } from "#io/ControllerError.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";

export const MakeCreatePatentEventRoute: Route = (r, ctx) => {
  AddEndpoint(r)(
    Endpoints.PatentEvent.Create,
    ({
      body: {
        links,
        keywords,
        media,
        payload: { owners, source, ...payload },
        ...body
      },
    }) => {
      ctx.logger.debug.log(
        "Create patent from url %s with owners %O and props %O",
        source,
        owners,
        body,
      );

      const fetchOwnersTask = sequenceS(TE.ApplicativePar)({
        link: ctx.db.findOneOrFail(LinkEntity, { where: { id: source } }),
        actors: pipe(
          owners.actors,
          O.fromPredicate((arr) => arr.length > 0),
          O.map((gg) =>
            ctx.db.find(ActorEntity, {
              where: { id: In(gg) },
            }),
          ),
          O.getOrElse(() => TE.right<ControllerError, ActorEntity[]>([])),
        ),
        groups: pipe(
          owners.groups,
          O.fromPredicate((arr) => arr.length > 0),
          O.map((gg) =>
            ctx.db.find(GroupEntity, {
              where: { id: In(gg) },
            }),
          ),
          O.getOrElse(() => TE.right<ControllerError, GroupEntity[]>([])),
        ),
      });

      return pipe(
        fetchOwnersTask,
        TE.chain(({ actors, groups, link }) =>
          createEventQuery({
            type: EVENT_TYPES.PATENT,
            ...body,
            payload: {
              ...payload,
              source: link.id,
              owners: {
                actors: actors.map((a) => a.id),
                groups: groups.map((g) => g.id),
              },
            },
            media,
            links,
            keywords,
          })(ctx),
        ),
        TE.chain((data) => ctx.db.save(EventV2Entity, [data])),
        TE.chain(([event]) =>
          ctx.db.findOneOrFail(EventV2Entity, {
            where: { id: Equal(event.id) },
            loadRelationIds: true,
          }),
        ),
        TE.chainEitherK(PatentIO.decodeSingle),
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
