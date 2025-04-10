import { type ActorEntity } from "@liexp/backend/lib/entities/Actor.entity.js";
import { ServerError } from "@liexp/backend/lib/errors/ServerError.js";
import { ActorIO } from "@liexp/backend/lib/io/Actor.io.js";
import { SearchFromWikipediaPubSub } from "@liexp/backend/lib/pubsub/searchFromWikipedia.pubSub.js";
import { ActorRepository } from "@liexp/backend/lib/services/entity-repository.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import {
  type Actor,
  AddActorBody,
  type CreateActorBody,
} from "@liexp/shared/lib/io/http/Actor.js";
import { ACTOR } from "@liexp/shared/lib/io/http/Common/BySubject.js";
import { Schema } from "effect";
import * as O from "fp-ts/lib/Option.js";
import { Equal } from "typeorm";
import { type TEReader } from "#flows/flow.types.js";

const createActorFromBody = (body: AddActorBody): TEReader<ActorEntity> => {
  return pipe(
    ActorRepository.findOne({
      where: { username: body.username },
    }),
    fp.RTE.filterOrElse(O.isNone, () => ServerError.of()),
    fp.RTE.chain(() =>
      ActorRepository.save([
        {
          ...body,
          avatar: body.avatar ? { id: body.avatar } : null,
          bornOn: body.bornOn?.toISOString(),
          diedOn: body.diedOn?.toISOString(),
        },
      ]),
    ),
    fp.RTE.map((a) => a[0]),
  );
};

export const createActor = (
  body: CreateActorBody,
): TEReader<Actor | { success: true }> => {
  if (Schema.is(AddActorBody)(body)) {
    return pipe(
      createActorFromBody(body),
      fp.RTE.chain((actor) =>
        ActorRepository.findOneOrFail({
          where: { id: Equal(actor.id) },
        }),
      ),
      fp.RTE.chain(
        (a) => (ctx) =>
          pipe(
            ActorIO.decodeSingle(a, ctx.env.SPACE_ENDPOINT),
            fp.TE.fromEither,
          ),
      ),
    );
  }

  return pipe(
    SearchFromWikipediaPubSub.publish({
      search: body.search,
      provider: "wikipedia",
      type: ACTOR.literals[0],
    }),
    fp.RTE.map(() => ({ success: true })),
  );
};
