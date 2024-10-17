import { type DBError } from "@liexp/backend/lib/providers/orm/database.provider.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { walkPaginatedRequest } from "@liexp/shared/lib/utils/fp.utils.js";
import { sequenceS } from "fp-ts/lib/Apply.js";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type Int } from "io-ts";
import { type CommandFlow } from "./command.type.js";
import { type ActorEntity } from "#entities/Actor.entity.js";
import { type GroupEntity } from "#entities/Group.entity.js";
import { type KeywordEntity } from "#entities/Keyword.entity.js";
import { toControllerError } from "#io/ControllerError.js";
import { fetchActors } from "#queries/actors/fetchActors.query.js";
import { fetchGroups } from "#queries/groups/fetchGroups.query.js";
import { fetchKeywords } from "#queries/keywords/fetchKeywords.query.js";

const makePatterns = (s: string, acronym: boolean): string[] => {
  const chunks = s.split(" ");
  const chunkAbove3 = chunks.filter((c) => c.length > 2);

  const patterns = [
    s,
    chunkAbove3.join(" "),
    chunkAbove3.reverse().join(" "),
    chunks.join(" "),
    chunks.reverse().join(" "),
  ];

  if (acronym) {
    patterns.push(makeAcronym(s));
  }

  return pipe(
    patterns,
    fp.A.uniq(fp.S.Eq),
    fp.A.filter((s) => s !== ""),
  );
};

const makeAcronym = (s: string): string => {
  const chunks = s.split(" ").filter((c) => c.length >= 2);
  if (chunks.length === 1) return s;

  return chunks.map((c) => c.slice(0, 1).toUpperCase()).join("");
};

export const upsertNLPEntities: CommandFlow = async (ctx) => {
  const result = await pipe(
    sequenceS(TE.ApplicativePar)({
      actors: walkPaginatedRequest<
        { total: number; results: ActorEntity[] },
        DBError,
        ActorEntity
      >(
        ({ skip, amount }) =>
          fetchActors({
            _start: O.some(skip as Int),
            _end: O.some(amount as Int),
          })(ctx),
        ({ total }) => total,
        ({ results }) => TE.right(results),
        0,
        50,
      )(ctx),
      groups: walkPaginatedRequest<
        [GroupEntity[], number],
        DBError,
        GroupEntity
      >(
        ({ skip, amount }) =>
          fetchGroups(ctx)({
            _start: O.some(skip as Int),
            _end: O.some(amount as Int),
          }),
        ([, t]) => t,
        ([rr]) => TE.right(rr),
        0,
        50,
      )(ctx),
      keywords: walkPaginatedRequest<
        [KeywordEntity[], number],
        DBError,
        KeywordEntity
      >(
        ({ skip, amount }) =>
          fetchKeywords(
            {
              _start: O.some(skip as Int),
              _end: O.some(amount as Int),
            },
            true,
          )(ctx),
        ([, t]) => t,
        ([rr]) => TE.right(rr),
        0,
        50,
      )(ctx),
    }),
    TE.chain(({ actors, groups, keywords }) => {
      const nplConfig = ctx.fs.resolve(`config/nlp/entities.json`);
      const entities = [
        {
          name: "actor",
          patterns: actors.flatMap((a) => makePatterns(a.fullName, false)),
        },
        {
          name: "group",
          patterns: groups.flatMap((g) => makePatterns(g.name, true)),
        },
        {
          name: "keyword",
          patterns: keywords.flatMap((g) => makePatterns(g.tag, false)),
        },
      ];
      return pipe(
        ctx.fs.writeObject(nplConfig, JSON.stringify(entities, null, 4)),
        TE.mapLeft(toControllerError),
      );
    }),
  )();

  ctx.logger.info.log("Output: %O", result);
};
