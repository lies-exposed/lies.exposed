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

            // ctx.logger.debug.log("Important text %s", text);

            const sentences: string[] = pipe(
              text,
              NLPUtils.string.removeHTMLTags,
              NLPUtils.string.removePunctuations,
              NLPUtils.string.removeExtraSpaces,
              NLPUtils.string.retainAlphaNums,
              NLPUtils.string.sentences,
              (sentences) => sentences.filter((s) => s.length > 50),
            );
            const s = sentences.join(" ");

            ctx.logger.debug.log("Cleaned string %s", s);
            const doc = nlp.readDoc(s);

            const entities: any[] = doc
              .customEntities()
              .out(nlp.its.detail, nlp.as.freqTable);

            let uniqueEntities: Array<Detail & { freq: number }> = entities
              .map((e) => ({
                ...e,
                freq: 1,
                value: e.type === "keyword" ? e.value.toLowerCase() : e.value,
              }))
              .reduce<any[]>((acc, n) => {
                const included = acc.findIndex(
                  (i) => i.value === n.value && i.type === n.type,
                );

                if (included >= 0) {
                  return acc;
                }
                return acc.concat({ ...n });
              }, []);

            doc.tokens().each((t) => {
              const token = t.out();
              const parentCustomEntity = t.parentCustomEntity();
              if (parentCustomEntity) {
                const parentEntity = parentCustomEntity.out(nlp.its.detail) as Detail;
                console.log(token, JSON.stringify(parentEntity, null, 2));
                uniqueEntities = uniqueEntities.map((e) => {
                  if (e.value === parentEntity.value.toLowerCase()) {
                    e.freq++;
                  }
                  return e;
                });
                // console.log(t.parentCustomEntity()?.out(nlp.its.detail), t.out(nlp.its.detail));
              }
            });

            if (uniqueEntities.length > 0) {
              ctx.logger.debug.log("Found entities %O", uniqueEntities);
            }
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
