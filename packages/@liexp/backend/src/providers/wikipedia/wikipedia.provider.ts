import { type Logger } from "@liexp/core/lib/logger/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
// eslint-disable-next-line  @typescript-eslint/consistent-type-imports
import wk, { type wikiSearchResult, type Page } from "wikipedia";

export interface WikipediaProvider {
  bot: any;
  search: (text: string) => TE.TaskEither<Error, wikiSearchResult>;
  parse: (title: string) => TE.TaskEither<Error, Page>;
}

interface WikipediaProviderOpts {
  logger: Logger;
  client: typeof wk;
}

const toMWError = (e: unknown): Error => {
  return e as Error;
};

const liftMWTE = <A>(p: () => Promise<A>): TE.TaskEither<Error, A> => {
  return TE.tryCatch(p, toMWError);
};

export const WikipediaProvider = ({
  logger,
  client,
}: WikipediaProviderOpts): WikipediaProvider => {
  logger.debug.log("Wikipedia provider created");

  return {
    bot: {},
    search: (text) => {
      return pipe(liftMWTE(() => client.search(text)));
    },
    parse: (text) => {
      return pipe(liftMWTE(() => client.page(text)));
    },
  };
};
