import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { sequenceS } from "fp-ts/lib/Apply";
import { Equal, In } from "typeorm";
import { ActorEntity } from "../../entities/Actor.entity";
import { type Route } from "../route.types";
import { toActorIO } from "./actor.io";
import { ActorFamily } from "@entities/ActorUnion.entity";
import { authenticationHandler } from "@utils/authenticationHandler";

export const MakeUpsertActorFamilyTreeRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(ctx, ["admin:create"]))(
    Endpoints.Actor.Custom.UpsertActorsFamilyTree,
    ({ params: { id }, body, headers }) => {
      ctx.logger.debug.log("Headers %O", { headers, body });
      const { partner, children } = body;
      return pipe(
        sequenceS(TE.ApplicativePar)({
          subject: ctx.db.findOneOrFail(ActorEntity, {
            where: { id },
          }),
          partner: ctx.db.findOneOrFail(ActorEntity, {
            where: { id: partner },
          }),
          children: ctx.db.find(ActorEntity, {
            where: { id: In(children) },
          }),
        }),
        TE.chain(({ subject, partner, children }) =>
          ctx.db.save(ActorFamily, [{ children, partner, subject }])
        ),
        TE.map(([af]) => af),

        TE.chain((actor) =>
          ctx.db.findOneOrFail(ActorEntity, {
            where: { id: Equal(actor.subject.id) },
            relations: ["family"],
          })
        ),
        TE.chainEitherK(toActorIO),
        TE.map((page) => ({
          body: {
            data: page,
          },
          statusCode: 201,
        }))
      );
    }
  );
};
