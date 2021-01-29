import { endpoints } from "@econnessione/shared";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import { Route } from "routes/route.types";
import { AddEndpoint } from "ts-endpoint-express";
import { ActorEntity } from "./actor.entity";

export const MakeCreateActorRoute: Route = (r, { db }) => {
  AddEndpoint(r)(endpoints.Actor.Create, ({ body }) => {
    return pipe(
      db.save(ActorEntity, [body]),
      TE.chain(([page]) =>
        db.findOneOrFail(ActorEntity, {
          where: { id: page.id },
          loadRelationIds: true,
        })
      ),
      TE.map((page) => ({
        body: {
          data: {
            ...page,
            type: "ActorFrontmatter" as const,
            groups: page.groups as any as string[],
            createdAt: page.createdAt.toISOString(),
            updatedAt: page.updatedAt.toISOString(),
            // body,
          },
        },
        statusCode: 201,
      }))
    );
  });
};
