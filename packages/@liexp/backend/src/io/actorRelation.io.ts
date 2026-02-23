import { pipe } from "@liexp/core/lib/fp/index.js";
import { DecodeError } from "@liexp/io/lib/http/Error/DecodeError.js";
import * as io from "@liexp/io/lib/index.js";
import { isValidValue } from "@liexp/shared/lib/providers/blocknote/isValidValue.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { IOError } from "@ts-endpoint/core";
import { Schema } from "effect";
import { sequenceS } from "fp-ts/lib/Apply.js";
import * as E from "fp-ts/lib/Either.js";
import { type ActorRelationEntity } from "../entities/ActorRelation.entity.js";
import { ActorIO } from "./Actor.io.js";
import { IOCodec } from "./DomainCodec.js";

const toActorRelationIO = (
  actorRelation: ActorRelationEntity,
): E.Either<DecodeError, io.http.ActorRelation.ActorRelation> => {
  return pipe(
    sequenceS(E.Applicative)({
      actor: ActorIO.encodeSingle(actorRelation.actor),
      relatedActor: ActorIO.encodeSingle(actorRelation.relatedActor),
    }),
    E.chain(({ actor, relatedActor }) =>
      pipe(
        {
          ...actorRelation,
          excerpt:
            (actorRelation.excerpt && isValidValue(actorRelation.excerpt)
              ? toInitialValue(actorRelation.excerpt)
              : null) ?? null,
          actor,
          relatedActor,
          startDate: actorRelation.startDate ?? undefined,
          endDate: actorRelation.endDate ?? undefined,
          deletedAt: actorRelation.deletedAt ?? undefined,
        },
        Schema.validateEither(io.http.ActorRelation.ActorRelation),
        E.mapLeft((e) =>
          DecodeError.of(
            `Failed to decode actor relation (${actorRelation.id})`,
            e,
          ),
        ),
      ),
    ),
  );
};

export const ActorRelationIO = IOCodec(
  io.http.ActorRelation.ActorRelation,
  {
    decode: toActorRelationIO,
    encode: () =>
      E.left(
        new IOError("Not implemented", {
          kind: "DecodingError",
          errors: [],
        }),
      ),
  },
  "ActorRelation",
);
