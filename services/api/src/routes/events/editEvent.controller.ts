import { AddEndpoint, Endpoints } from "@econnessione/shared/endpoints";
import { UUID } from "@econnessione/shared/io/http/Common";
import { uuid } from "@econnessione/shared/utils/uuid";
import { Router } from "express";
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { toEventIO } from "./event.io";
import { EventEntity } from "@entities/Event.entity";
import { foldOptionals } from "@utils/foldOptionals.utils";
import { RouteContext } from "routes/route.types";

export const MakeEditEventRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(
    Endpoints.Event.Edit,
    ({
      params: { id },
      body: { links, media, actors, groups, groupsMembers, keywords, ...body },
    }) => {
      ctx.logger.debug.log("Incoming body %O", body);

      const updateData = foldOptionals({
        ...body,
        actors: pipe(actors, O.map(A.map((a) => ({ id: a })))),
        groups: pipe(groups, O.map(A.map((g) => ({ id: g })))),
        groupsMembers: pipe(groupsMembers, O.map(A.map((g) => ({ id: g })))),
        keywords: pipe(keywords, O.map(A.map((k) => ({ id: k })))),
        links: pipe(
          links,
          O.map(A.map((l) => (UUID.is(l) ? { id: l } : { id: uuid(), ...l })))
        ),
        media: pipe(
          media,
          O.map(
            A.map((i) =>
              UUID.is(i)
                ? { id: i }
                : {
                    ...i,
                    id: uuid(),
                  }
            )
          )
        ),
      });

      ctx.logger.debug.log("Update data %O", updateData);

      return pipe(
        ctx.db.save(EventEntity, [{ id, ...updateData }]),
        TE.chain(() =>
          ctx.db.findOneOrFail(EventEntity, {
            where: { id },
            relations: ["media"],
            loadRelationIds: {
              relations: [
                "actors",
                "groups",
                "groupsMembers",
                "links",
                "keywords",
              ],
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
