import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { walkPaginatedRequest } from "@liexp/shared/lib/utils/fp.utils.js";
import { sequenceS } from "fp-ts/lib/Apply.js";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { startContext, stopContext } from "./start-ctx.js";
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
  ]

  if (acronym) {
    patterns.push(makeAcronym(s))
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

const run = async (): Promise<any> => {
  const ctx = await startContext();

  const result = await pipe(
    sequenceS(TE.ApplicativePar)({
      actors: walkPaginatedRequest(ctx)(
        ({ skip, amount }) =>
          fetchActors(ctx)({
            _start: O.some(skip as any),
            _end: O.some(amount as any),
          }),
        ({ total }) => total,
        ({ results }) => results,
        0,
        50,
      ),
      groups: walkPaginatedRequest(ctx)(
        ({ skip, amount }) =>
          fetchGroups(ctx)({
            _start: O.some(skip as any),
            _end: O.some(amount as any),
          }),
        ([, t]) => t,
        ([rr]) => rr,
        0,
        50,
      ),
      keywords: walkPaginatedRequest(ctx)(
        ({ skip, amount }) =>
          fetchKeywords(ctx)(
            {
              _start: O.some(skip as any),
              _end: O.some(amount as any),
            },
            true,
          ),
        ([, t]) => t,
        ([rr]) => rr,
        0,
        50,
      ),
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
      );
    }),
  )();

  ctx.logger.info.log("Output: %O", result);

  await stopContext(ctx);
};

// eslint-disable-next-line no-console
void run().catch(console.error);
