import { ActorEntity } from "@liexp/backend/lib/entities/Actor.entity.js";
import { type NationEntity } from "@liexp/backend/lib/entities/Nation.entity.js";
import { ActorIO } from "@liexp/backend/lib/io/Actor.io.js";
import { foldOptionals } from "@liexp/backend/lib/utils/foldOptionals.utils.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { type BlockNoteDocument } from "@liexp/shared/lib/io/http/Common/BlockNoteDocument.js";
import { UUID } from "@liexp/shared/lib/io/http/Common/index.js";
import { Schema } from "effect";
import * as O from "effect/Option";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type DeepPartial, Equal } from "typeorm";
import { type Route } from "../route.types.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

export const MakeEditActorRoute: Route = (r, { db, logger, jwt, s3 }) => {
  AddEndpoint(r, authenticationHandler(["admin:create"])({ logger, jwt }))(
    Endpoints.Actor.Edit,
    ({
      params: { id },
      body: { memberIn, bornOn, diedOn, avatar, nationalities, ...body },
    }) => {
      const updateData = {
        ...foldOptionals({ ...body }),
        bornOn: O.getOrUndefined(bornOn),
        diedOn: O.getOrUndefined(diedOn),
        avatar: pipe(
          avatar,
          O.map((a) => ({ id: a })),
          O.getOrUndefined,
        ),
        nationalities: pipe(
          nationalities,
          O.map(
            (nations): DeepPartial<NationEntity[]> =>
              nations.map((n) => ({ id: n })),
          ),
          O.getOrElse((): DeepPartial<NationEntity[]> => []),
        ),
        memberIn: pipe(
          memberIn,
          O.map(
            fp.A.map((m) => {
              if (Schema.is(UUID)(m)) {
                return {
                  id: m,
                  actor: { id },
                };
              }

              return {
                ...m,
                startDate: m.startDate,
                endDate: O.getOrNull(m.endDate),
                actor: { id },
                group: { id: m.group },
              };
            }),
          ),
          O.getOrElse(() => []),
        ),
      };

      logger.info.log("Actor update data %O", updateData);
      return pipe(
        db.findOneOrFail(ActorEntity, { where: { id: Equal(id) } }),
        TE.chain((actor) =>
          db.save(ActorEntity, [
            {
              ...actor,
              id,
              ...updateData,
              nationalities: updateData.nationalities ?? actor.nationalities,
              memberIn: [...updateData.memberIn],
              excerpt: [...updateData.excerpt],
              body: updateData.body
                ? (updateData.body as BlockNoteDocument)
                : actor.body,
            },
          ]),
        ),
        TE.chain(() =>
          db.findOneOrFail(ActorEntity, {
            where: { id: Equal(id) },
            loadRelationIds: {
              relations: ["memberIn"],
            },
          }),
        ),
        TE.chainEitherK((a) => ActorIO.decodeSingle(a)),
        TE.map((actor) => ({
          body: {
            data: actor,
          },
          statusCode: 200,
        })),
      );
    },
  );
};
