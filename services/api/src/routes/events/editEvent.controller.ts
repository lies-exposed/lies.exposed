import { Endpoints, AddEndpoint } from "@econnessione/shared/endpoints";
import { EventLink } from "@econnessione/shared/io/http/Events/EventLink";
import { uuid } from "@econnessione/shared/utils/uuid";
import { EventEntity } from "@entities/Event.entity";
import { foldOptionals } from "@utils/foldOptionals.utils";
import { Router } from "express";
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { RouteContext } from "routes/route.types";
import { toEventIO } from "./event.io";

export const MakeEditEventRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(
    Endpoints.Event.Edit,
    ({
      params: { id },
      body: { links, images, actors, groups, groupsMembers, ...body },
    }) => {
      ctx.logger.debug.log("Incoming body %O", body);

      const updateData = foldOptionals({
        ...body,
        actors: pipe(actors, O.map(A.map((a) => ({ id: a })))),
        groups: pipe(groups, O.map(A.map((g) => ({ id: g })))),
        groupsMembers: pipe(groupsMembers, O.map(A.map((g) => ({ id: g })))),
        links: pipe(
          links,
          O.map(A.map((l) => (EventLink.is(l) ? l : { id: uuid(), ...l })))
        ),
        images: pipe(
          images,
          O.map((imgs) =>
            imgs.map((i) => ({
              id: uuid(),
              ...i,
            }))
          )
        ),
      });

      ctx.logger.debug.log("Update data %O", updateData);

      return pipe(
        ctx.db.save(EventEntity, [{ id, ...updateData }]),
        TE.chain(() =>
          ctx.db.findOneOrFail(EventEntity, {
            where: { id },
            relations: ["images", "links"],
            loadRelationIds: {
              relations: ["actors", "groups", "groupsMembers"],
            },
          })
        ),
        TE.chainEitherK((event) => toEventIO(event)),
        TE.map((event) => ({
          body: {
            data: event,
          },
          statusCode: 200,
        }))
      );
    }
  );
};
