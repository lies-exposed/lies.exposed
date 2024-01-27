import path from "path";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import {
  ExtractEntitiesWithNLPInput,
  type ExtractEntitiesWithNLPOutput,
} from "@liexp/shared/lib/io/http/admin/ExtractNLPEntities.js";
import { GetEncodeUtils } from "@liexp/shared/lib/utils/encode.utils.js";
import { toRecord } from "fp-ts/lib/ReadonlyRecord.js";
import { type TEFlow } from "#flows/flow.types.js";
import { extractRelationsFromText } from "#flows/nlp/extractRelationsFromText.flow.js";
import { extractRelationsFromURL } from '#flows/nlp/extractRelationsFromURL.flow.js';
import { toControllerError } from "#io/ControllerError.js";

export const extractEntitiesFromAny: TEFlow<
  [ExtractEntitiesWithNLPInput],
  ExtractEntitiesWithNLPOutput["data"]
> = (ctx) => (body) => {
  return pipe(
    () => {
      if (ExtractEntitiesWithNLPInput.types[0].is(body)) {
        return pipe(
          ctx.puppeteer.getBrowserFirstPage(body.url, {}),
          fp.TE.mapLeft(toControllerError),
          fp.TE.chain((p) =>
            pipe(
              extractRelationsFromURL(ctx)(p, body.url),
              fp.TE.chainFirst(() =>
                fp.TE.tryCatch(() => p.close(), toControllerError),
              ),
            ),
          ),
        );
      }

      if (ExtractEntitiesWithNLPInput.types[1].is(body)) {
        return extractRelationsFromText(ctx)(body.text);
      }
      return fp.TE.left(toControllerError({ message: "Invalid body" }));
    },
    fp.TE.fromIO,
    fp.TE.chain((te) => te),
  );
};

export const extractEntitiesFromAnyCached: TEFlow<
  [ExtractEntitiesWithNLPInput],
  ExtractEntitiesWithNLPOutput["data"]
> = (ctx) => (body) => {
  const bodyHash = GetEncodeUtils((r) =>
    toRecord<string, string>(r as any),
  ).hash(body);
  const filePath = ctx.fs.resolve(
    path.resolve(ctx.config.dirs.temp.nlp, `${bodyHash}.json`),
  );
  return pipe(
    extractEntitiesFromAny(ctx)(body),
    ctx.fs.getOlderThanOr(filePath, 60 * 60 * 1000),
  );
};
