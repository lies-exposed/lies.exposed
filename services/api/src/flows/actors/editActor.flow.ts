import { type NationEntity } from "@liexp/backend/lib/entities/Nation.entity.js";
import { ActorIO } from "@liexp/backend/lib/io/Actor.io.js";
import { ActorRepository } from "@liexp/backend/lib/services/entity-repository.service.js";
import { foldOptionals } from "@liexp/backend/lib/utils/foldOptionals.utils.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import {
  type Actor,
  type EditActorBody,
} from "@liexp/shared/lib/io/http/Actor.js";
import { type UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import * as O from "effect/Option";
import { type DeepPartial, Equal } from "typeorm";
import { type TEReader } from "#flows/flow.types.js";

export interface EditActorInput extends EditActorBody {
  id: UUID;
}

export const editActor = (input: EditActorInput): TEReader<Actor> => {
  const {
    id,
    memberIn,
    bornOn,
    diedOn,
    avatar,
    nationalities,
    username,
    fullName,
    color,
    excerpt,
    body,
  } = input;

  const updateData = {
    ...foldOptionals({
      username,
      fullName,
      color,
      excerpt,
      body,
    }),
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
        (nations) =>
          nations.map((n) => ({ id: n })) as DeepPartial<NationEntity[]>,
      ),
      O.getOrElse(() => [] as DeepPartial<NationEntity[]>),
    ),
    memberIn: pipe(
      memberIn,
      O.map((members) =>
        members.map((m) => {
          if (typeof m === "string") {
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

  return pipe(
    ActorRepository.findOneOrFail({ where: { id: Equal(id as any) } }),
    fp.RTE.chain((actor) =>
      ActorRepository.save([
        {
          ...actor,
          id,
          ...updateData,
          nationalities: updateData.nationalities.length
            ? updateData.nationalities
            : actor.nationalities,
          memberIn: [...updateData.memberIn],
          excerpt: updateData.excerpt ?? actor.excerpt,
          body: updateData.body ?? actor.body,
        },
      ]),
    ),
    fp.RTE.chain(() =>
      ActorRepository.findOneOrFail({
        where: { id: Equal(id) },
        loadRelationIds: {
          relations: ["memberIn"],
        },
      }),
    ),
    fp.RTE.chainEitherK((actor) => ActorIO.decodeSingle(actor)),
  );
};
