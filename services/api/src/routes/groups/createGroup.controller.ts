import { Endpoints, AddEndpoint } from "@econnessione/shared/endpoints";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { ActorEntity } from "../../entities/Actor.entity";
import { GroupEntity } from "../../entities/Group.entity";
import { Route } from "routes/route.types";

export const MakeCreateGroupRoute: Route = (r, { s3, db, env }) => {
  AddEndpoint(r)(Endpoints.Group.Create, ({ body: { color, ...body } }) => {
    return pipe(
      db.save(GroupEntity, [
        {
          ...body,
          color: color.replace("#", ""),
          members: body.members.map((m) => {
            const a = new ActorEntity();
            a.id = m;
            return a;
          }),
        },
      ]),
      TE.chain(([page]) =>
        db.findOneOrFail(GroupEntity, {
          where: { id: page.id },
          loadRelationIds: true,
        })
      ),
      TE.map((page) => ({
        body: {
          data: {
            ...page,
            type: "GroupEntity" as const,
            // members: (page.members as any) as string[],
            // subGroups: (page.subGroups as any) as string[],
            createdAt: page.createdAt.toISOString(),
            updatedAt: page.updatedAt.toISOString(),
            // body,
          },
        },
        statusCode: 200,
      }))
    );
  });
};
