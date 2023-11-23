/* eslint-disable @typescript-eslint/no-var-requires */
require("module-alias")(process.cwd());

// other imports
import { fp } from "@liexp/core/lib/fp";
import { walkPaginatedRequest } from "@liexp/shared/lib/utils/fp.utils";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { sequenceS } from "fp-ts/lib/Apply";
import { fetchActors } from "@queries/actors/fetchActors.query";
import { fetchGroups } from "@queries/groups/fetchGroups.query";
import { fetchKeywords } from "@queries/keywords/fetchKeywords.query";
import { startContext, stopContext } from "./start-ctx";

const makePatterns = (s: string): string[] => {
  const chunks = s.split(" ");
  const chunkAbove3 = chunks.filter((c) => c.length > 2);

  return pipe(
    [
      s,
      chunkAbove3.join(" "),
      chunkAbove3.reverse().join(" "),
      chunks.join(" "),
      chunks.reverse().join(" "),
    ],
    fp.A.uniq(fp.S.Eq),
    fp.A.filter((s) => s !== "")
  );
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
        50
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
        50
      ),
      keywords: walkPaginatedRequest(ctx)(
        ({ skip, amount }) =>
          fetchKeywords(ctx)({
            _start: O.some(skip as any),
            _end: O.some(amount as any),
          }, true),
        ([, t]) => t,
        ([rr]) => rr,
        0,
        50
      ),
    }),
    TE.chain(({ actors, groups, keywords }) => {
      const nplConfig = ctx.fs.resolve(`config/nlp/entities.json`);
      const entities = [
        {
          name: "actor",
          patterns: actors.flatMap((a) => makePatterns(a.fullName)),
        },
        {
          name: "group",
          patterns: groups.flatMap((g) => makePatterns(g.name)),
        },
        {
          name: "keyword",
          patterns: keywords.flatMap((g) => makePatterns(g.tag)),
        },
      ];
      return pipe(
        ctx.fs.writeObject(nplConfig, JSON.stringify(entities, null, 4))
      );
    })
  )();

  ctx.logger.info.log("Output: %O", result);

  await stopContext(ctx);
};

// eslint-disable-next-line no-console
void run().catch(console.error);
