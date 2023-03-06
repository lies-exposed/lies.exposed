import { fp } from "@liexp/core/fp";
import { walkPaginatedRequest } from "@liexp/shared/utils/fp.utils";
import { throwTE } from "@liexp/shared/utils/task.utils";
import dotenv from "dotenv";
import { sequenceS } from "fp-ts/lib/Apply";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { fetchActors } from "../src/queries/actors/fetchActors.query";
import { fetchGroups } from "../src/queries/groups/fetchGroups.query";
import { fetchKeywords } from "../src/queries/keywords/fetchKeywords.query";
import { makeContext } from "../src/server";

dotenv.config();

const makePatterns = (s) => {
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

const run = async () => {
  const ctx = await throwTE(
    makeContext({ ...process.env, TG_BOT_POLLING: "false" })
  );

  const result = await pipe(
    sequenceS(TE.ApplicativePar)({
      actors: walkPaginatedRequest(ctx)(
        ({ skip, amount }) =>
          fetchActors(ctx)({
            _start: O.some(skip),
            _end: O.some(amount),
          }),
        ({ total }) => total,
        ({ results }) => results,
        0,
        50
      ),
      groups: walkPaginatedRequest(ctx)(
        ({ skip, amount }) =>
          fetchGroups(ctx)({
            _start: O.some(skip),
            _end: O.some(amount),
          }),
        ([, t]) => t,
        ([rr]) => rr,
        0,
        50
      ),
      keywords: walkPaginatedRequest(ctx)(
        ({ skip, amount }) =>
          fetchKeywords(ctx)({
            _start: O.some(skip),
            _end: O.some(amount),
          }),
        ([, t]) => t,
        ([rr]) => rr,
        0,
        50
      ),
    }),
    TE.chainTaskK(({ actors, groups, keywords }) => {
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
};

// eslint-disable-next-line no-console
run().catch(console.error);
