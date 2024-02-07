import { type Logger } from "@liexp/core/lib/logger/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { type IOError } from "ts-io-error";
import model from "wink-eng-lite-web-model";
import winkNLP, {
  type SentenceImportance,
  type CustomEntityExample,
  type Detail,
} from "wink-nlp";
import NLPUtils from "wink-nlp-utils";

interface NERProvider {
  entitiesFile: string;
  process: (
    text: string,
    patterns: CustomEntityExample[],
  ) => TE.TaskEither<
    IOError,
    {
      entities: Detail[];
      sentences: Array<{ text: string; importance: number }>;
    }
  >;
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

            ctx.logger.debug.log("Original text %s", text);

            const cleanedText = pipe(
              text,
              NLPUtils.string.removeHTMLTags,
              // NLPUtils.string.removePunctuations,
              NLPUtils.string.removeExtraSpaces,
              NLPUtils.string.retainAlphaNums,
              NLPUtils.string.sentences,
              (sentences) => sentences.filter((s) => s.length > 50),
            ).join("\n");

            ctx.logger.debug.log("Cleaned string %s", cleanedText);
            const doc = nlp.readDoc(text);

            const sentencesImportance = doc.out(
              nlp.its.sentenceWiseImportance,
            ) as SentenceImportance[];

            const sentences = doc.sentences();

            const wiseImportantSentences = sentencesImportance.flatMap((s) => {
              const sentence =
                s.importance > 0.001 && sentences.itemAt(s.index);
              if (sentence) {
                return [
                  {
                    text: sentence.out(),
                    importance: s.importance,
                  },
                ];
              }
              return [];
            });

            const entities: any[] = doc
              .customEntities()
              .out(nlp.its.detail, nlp.as.freqTable);

            let uniqueEntities: Array<Detail & { freq: number }> = entities
              .map((e) => ({
                ...e,
                value: e.type === "keyword" ? e.value.toLowerCase() : e.value,
                freq: 0,
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
              const parentCustomEntity = t.parentCustomEntity();
              if (parentCustomEntity) {
                const parentEntity = parentCustomEntity.out(
                  nlp.its.detail,
                ) as Detail;
                uniqueEntities = uniqueEntities.map((e) => {
                  if (
                    e.value.toLowerCase() === parentEntity.value.toLowerCase()
                  ) {
                    e.freq++;
                  }
                  return e;
                });
              }
            });

            uniqueEntities.sort((a, b) => b.freq - a.freq);

            if (uniqueEntities.length > 0) {
              ctx.logger.debug.log("Found entities %O", uniqueEntities);
            }

            return { entities, sentences: wiseImportantSentences };
          },
          (e: any) => e,
        ),
      );
    },
  };
};
