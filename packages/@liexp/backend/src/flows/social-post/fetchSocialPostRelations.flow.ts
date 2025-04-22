import { pipe } from "@liexp/core/lib/fp/index.js";
import { UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { Schema } from "effect";
import * as O from "effect/Option";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { type DatabaseContext } from "../../context/db.context.js";
import { type ENVContext } from "../../context/env.context.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { type ActorEntity } from "../../entities/Actor.entity.js";
import { type GroupEntity } from "../../entities/Group.entity.js";
import { type KeywordEntity } from "../../entities/Keyword.entity.js";
import { type MediaEntity } from "../../entities/Media.entity.js";
import { type SocialPostEntity } from "../../entities/SocialPost.entity.js";
import { type ServerError } from "../../errors/index.js";
import { fetchRelations } from "../../queries/common/fetchRelations.query.js";

export interface SocialPostRelations {
  actors: ActorEntity[];
  groups: GroupEntity[];
  keywords: KeywordEntity[];
  media: MediaEntity[];
}

export const fetchSocialPostRelations = <
  C extends LoggerContext & DatabaseContext & ENVContext,
>(
  sp: Pick<
    SocialPostEntity["content"],
    "actors" | "groups" | "keywords" | "media"
  >,
): ReaderTaskEither<C, ServerError, SocialPostRelations> => {
  return pipe(
    fetchRelations(
      {
        actors: pipe(
          sp.actors,
          O.fromNullable,
          O.filter((a) => a.length > 0),
          O.map((a) => (Schema.is(Schema.Array(UUID))(a) ? a : [])),
        ),
        groups: pipe(
          sp.groups,
          O.fromNullable,
          O.filter((g) => g.length > 0),
          O.map((a) => (Schema.is(Schema.Array(UUID))(a) ? a : [])),
        ),
        keywords: pipe(
          sp.keywords,
          O.fromNullable,
          O.filter((k) => k.length > 0),
          O.map((a) => (Schema.is(Schema.Array(UUID))(a) ? a : [])),
        ),
        media: pipe(
          sp.media,
          O.fromNullable,
          O.filter((m) => m.length > 0),
          O.map((a) => (Schema.is(Schema.Array(UUID))(a) ? a : [])),
        ),
        links: O.none(),
        groupsMembers: O.none(),
      },
      true,
    ),
  );
};
