import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import {
  AddActorBody,
  type CreateActorBody,
} from "@liexp/shared/lib/io/http/Actor.js";
import * as O from "fp-ts/lib/Option.js";
import { type ActorEntity } from "../../entities/Actor.entity.js";
import { searchActorAndCreateFromWikipedia } from "#flows/actors/fetchAndCreateActorFromWikipedia.flow.js";
import { type TEReader } from "#flows/flow.types.js";
import { ServerError } from "#io/ControllerError.js";
import { ActorRepository } from "#providers/db/entity-repository.provider.js";

export const createActor = (body: CreateActorBody): TEReader<ActorEntity> => {
  if (AddActorBody.is(body)) {
    return pipe(
      ActorRepository.findOne({
        where: { username: body.username },
      }),
      fp.RTE.filterOrElse(O.isNone, () => ServerError()),
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
  return searchActorAndCreateFromWikipedia(body.search, "wikipedia");
};
