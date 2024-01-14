import { type Logger } from "@liexp/core/lib/logger/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { type IOError } from "ts-io-error";
import model from "wink-eng-lite-web-model";
import winkNLP, { type CustomEntityExample, type Detail } from "wink-nlp";
import NLPUtils from "wink-nlp-utils";

interface NERProvider {
  entitiesFile: string;
  process: (
    text: string,
    patterns: CustomEntityExample[],
  ) => TE.TaskEither<IOError, Detail[]>;
}

export const GetNERProvider = (ctx: { logger: Logger }): NERProvider => {
  return {
    entitiesFile: `config/nlp/entities.json`,
    process: (text, patterns) => {
      ctx.logger.debug.log("Looking for %O", patterns);
      return pipe(
        TE.tryCatch(
          async () => {
            const nlp = winkNLP(model);
            nlp.learnCustomEntities(patterns, {
              useEntity: true,
              usePOS: true,
            });

            const sentences: string[] = pipe(
              text,
              NLPUtils.string.removeHTMLTags,
              NLPUtils.string.removePunctuations,
              NLPUtils.string.removeExtraSpaces,
              NLPUtils.string.retainAlphaNums,
              NLPUtils.string.sentences,
            );
            const s = sentences.join(" ");

            ctx.logger.debug.log("Cleaned string %s", s);
            const doc = nlp.readDoc(s);

            const entities: any[] = doc.customEntities().out(nlp.its.detail);

            const uniqueEntities: Detail[] = entities.reduce<any[]>(
              (acc, n) => {
                if (acc.includes(n)) {
                  return acc;
                }
                return acc.concat(n);
              },
              [],
            );

            if (uniqueEntities.length > 0) {
              ctx.logger.debug.log("Found entities %O", uniqueEntities);
            }

            // const tokens = doc.tokens();

            // const tokenize = NLPUtils.string.tokenize(s, true);
            // tokens.each((t) => {
            //   ctx.logger.debug.log("Token %O", t, t.out());
            // });

            // const out = tokens.out();

            return entities;
          },
          (e: any) => e,
        ),
      );
    },
  };
};
