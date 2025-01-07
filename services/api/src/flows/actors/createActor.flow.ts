import { ActorEntity } from "@liexp/backend/lib/entities/Actor.entity.js";
import { ServerError } from "@liexp/backend/lib/errors/ServerError.js";
import { SearchFromWikipediaPubSub } from "@liexp/backend/lib/pubsub/searchFromWikipedia.pubSub.js";
import { ActorRepository } from "@liexp/backend/lib/services/entity-repository.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import {
  AddActorBody,
  type CreateActorBody,
} from "@liexp/shared/lib/io/http/Actor.js";
import { ACTOR } from "@liexp/shared/lib/io/http/Common/BySubject.js";
import * as O from "fp-ts/lib/Option.js";
import { type TEReader } from "#flows/flow.types.js";

export const createActor = (body: CreateActorBody): TEReader<ActorEntity> => {
  if (AddActorBody.is(body)) {
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
      fp.RTE.map(([actor]) => actor),
    );
  }
  return pipe(
    SearchFromWikipediaPubSub.publish({
      search: body.search,
      provider: "wikipedia",
      type: ACTOR.value,
    }),
    // TODO: remove this line
    fp.RTE.map(() => {
      const actor = new ActorEntity();
      actor.username = body.search;
      return actor;
    }),
  );
};
