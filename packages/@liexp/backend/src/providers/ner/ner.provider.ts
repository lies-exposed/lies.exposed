import { fp } from "@liexp/core/lib/fp/index.js";
import { type Logger } from "@liexp/core/lib/logger/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { IOError } from "ts-io-error";
import model from "wink-eng-lite-web-model";
import winkNLP, {
  type CustomEntityExample,
  type Detail,
  type SentenceImportance,
} from "wink-nlp";
import NLPUtils from "wink-nlp-utils";

interface UniqueEntity extends Detail {
  freq: number;
}

interface NERResults {
  entities: UniqueEntity[];
  sentences: { text: string; importance: number }[];
}

interface NERProvider {
  entitiesFile: string;
  process: (
    text: string,
    patterns: CustomEntityExample[],
  ) => TE.TaskEither<IOError, NERResults>;
}

export const GetNERProvider = (ctx: { logger: Logger }): NERProvider => {
  return {
    entitiesFile: `config/nlp/entities.json`,
    process: (text, patterns) => {
      ctx.logger.debug.log("Looking for %O", patterns);
      return pipe(
        fp.IOE.tryCatch(
          (): NERResults => {
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

            const wiseImportantSentences: NERResults["sentences"] =
              sentencesImportance.flatMap((s) => {
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

            const entities = doc
              .customEntities()
              .out(nlp.its.detail, nlp.as.freqTable) as Detail[];

            let uniqueEntities: (Detail & { freq: number })[] = entities
              .map(
                (e): UniqueEntity => ({
                  ...e,
                  value: e.type === "keyword" ? e.value.toLowerCase() : e.value,
                  freq: 0,
                }),
              )
              .reduce<UniqueEntity[]>((acc, n) => {
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

            return {
              entities: uniqueEntities,
              sentences: wiseImportantSentences,
            };
          },
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          (e: any) => e,
        ),
        fp.TE.fromIOEither,
      );
    },
  };
};
