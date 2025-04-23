import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import * as O from "effect/Option";
import { sequenceS } from "fp-ts/lib/Apply.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { type DatabaseContext } from "../../context/db.context.js";
import { type ENVContext } from "../../context/env.context.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { type ActorEntity } from "../../entities/Actor.entity.js";
import { type GroupEntity } from "../../entities/Group.entity.js";
import { type KeywordEntity } from "../../entities/Keyword.entity.js";
import { type LinkEntity } from "../../entities/Link.entity.js";
import { type MediaEntity } from "../../entities/Media.entity.js";
import { type DBError } from "../../providers/orm/database.provider.js";
import { fetchActors } from "../actors/fetchActors.query.js";
import { fetchGroups } from "../groups/fetchGroups.query.js";
import { fetchKeywords } from "../keywords/fetchKeywords.query.js";
import { fetchLinks } from "../links/fetchLinks.query.js";
import { fetchManyMedia } from "../media/fetchManyMedia.query.js";

export const fetchRelations =
  <C extends LoggerContext & DatabaseContext & ENVContext>(
    input: {
      actors: O.Option<readonly UUID[]>;
      groups: O.Option<readonly UUID[]>;
      media: O.Option<readonly UUID[]>;
      links: O.Option<readonly UUID[]>;
      keywords: O.Option<readonly UUID[]>;
      groupsMembers: O.Option<readonly UUID[]>;
    },
    isAdmin: boolean,
  ): ReaderTaskEither<
    C,
    DBError,
    {
      actors: ActorEntity[];
      groups: GroupEntity[];
      keywords: KeywordEntity[];
      media: MediaEntity[];
      links: LinkEntity[];
    }
  > =>
  (ctx) => {
    ctx.logger.debug.log("Links %O", input.links);
    ctx.logger.debug.log("Media %O", input.media);
    ctx.logger.debug.log("Keywords %O", input.keywords);

    return sequenceS(fp.TE.ApplicativePar)({
      actors: O.isSome(input.actors)
        ? pipe(
            fetchActors({
              ids: input.actors,
              _end: pipe(
                input.actors,
                O.map((a) => a.length),
              ),
            })(ctx),
            fp.TE.map((r) => r.results),
          )
        : fp.TE.right([]),
      groups: O.isSome(input.groups)
        ? pipe(
            fetchGroups({
              ids: input.groups,
              _end: pipe(
                input.groups,
                O.map((a) => a.length),
              ),
            })(ctx),
            fp.TE.map(([results]) => results),
          )
        : fp.TE.right([]),
      keywords: O.isSome(input.keywords)
        ? pipe(
            fetchKeywords(
              {
                ids: input.keywords,
                _end: pipe(
                  input.keywords,
                  O.map((a) => a.length),
                ),
              },
              isAdmin,
            )(ctx),
            fp.TE.map(([results]) => results),
          )
        : fp.TE.right([]),
      media: O.isSome(input.media)
        ? pipe(
            fetchManyMedia({
              ids: input.media,
              _end: pipe(
                input.media,
                O.map((m) => m.length),
              ),
            })(ctx),
            fp.TE.map(([results]) => results),
          )
        : fp.TE.right([]),
      links: O.isSome(input.links)
        ? pipe(
            fetchLinks(
              {
                ids: input.links,
                _end: pipe(
                  input.links,
                  O.map((a) => a.length),
                ),
              },
              false,
            )(ctx),
            fp.TE.map(([results]) => results),
          )
        : fp.TE.right([]),
    });
  };
