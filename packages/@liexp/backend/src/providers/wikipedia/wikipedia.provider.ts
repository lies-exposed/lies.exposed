import { pipe, fp } from "@liexp/core/lib/fp/index.js";
import { type Logger } from "@liexp/core/lib/logger/index.js";
import { ensureHTTPS } from "@liexp/shared/lib/utils/url.utils.js";
import {
  type AxiosRequestConfig,
  type AxiosInstance,
  type AxiosResponse,
} from "axios";
import * as TE from "fp-ts/lib/TaskEither.js";
import type Bot from "nodemw";
import type { ArticleInfo, SearchResult } from "nodemw/lib/types.js";

interface RESTArticleSummary {
  title: string;
  titles: {
    canonical: string;
    normalized: string;
  };
  description: string;
  thumbnail?: {
    source: string;
    width: number;
    height: number;
  };
  originalimage?: {
    source: string;
    width: number;
    height: number;
  };
  extract: string;
}

export interface WikipediaProvider {
  bot: Bot;
  search: (text: string) => TE.TaskEither<Error, SearchResult[]>;
  parse: (text: string, title: string) => TE.TaskEither<Error, string>;
  /**
   * Retrieve article content (in wikitext format)
   */

  article: (title: string) => TE.TaskEither<Error, string>;
  articleInfo: (
    title: string,
    options: any,
  ) => TE.TaskEither<Error, ArticleInfo[]>;
  articleSummary: (title: string) => TE.TaskEither<Error, RESTArticleSummary>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  articleFeaturedImage: (title: string) => TE.TaskEither<Error, any>;
}

interface WikipediaProviderOpts {
  logger: Logger;
  client: Bot;
  restClient: AxiosInstance;
}

const toMWError = (e: unknown): Error => {
  return e as Error;
};

export const WikipediaProvider = ({
  logger,
  client,
  restClient,
}: WikipediaProviderOpts): WikipediaProvider => {
  logger.debug.log("Wikipedia provider created");

  // const apiCallTask = (params: any) =>
  //   TE.tryCatch(
  //     () =>
  //       new Promise((resolve, reject) => {
  //         (client as any).api.call(
  //           params,
  //           (err: Error, info: any, next: any, data: any) => {
  //             if (err) {
  //               return reject(err);
  //             }
  //             return resolve(info);
  //           },
  //         );
  //       }),
  //     toMWError,
  //   );

  /**
   * REST API client
   * https://github.com/dopecodez/Wikipedia/blob/50074c8279d109be13142145c3df2116c90116da/source/request.ts
   */
  const restClientTask = <R, C = any>(params: AxiosRequestConfig<C>) =>
    pipe(
      TE.tryCatch(
        () => restClient<any, AxiosResponse<R, C>, C>(params),
        toMWError,
      ),
      TE.map((res) => res.data),
    );

  return {
    bot: client,
    search: (text) => {
      return pipe(
        TE.taskify(client.search.bind(client))(text),
        TE.mapLeft(toMWError),
      );
    },
    parse: (text, title) => {
      return pipe(
        TE.taskify(client.parse.bind(client))(text, title),
        TE.mapLeft(toMWError),
        // TE.map((info) => info[0]),
      );
    },
    article: (title) => {
      return pipe(
        TE.taskify<string, any, string>(client.getArticle.bind(client))(title),
        TE.mapLeft(toMWError),
      );
    },
    articleInfo: (title, options) => {
      return pipe(
        TE.taskify(client.getArticleInfo.bind(client))(title, options),
        TE.mapLeft(toMWError),
      );
    },
    articleSummary: (title) => {
      return pipe(
        restClientTask({
          url: `/page/summary/${title.replace(/ /g, "_")}`,
        }),
      );
    },
    /**
     * Get article images in order of appearance by title
     *
     * https://github.com/dopecodez/Wikipedia/blob/50074c8279d109be13142145c3df2116c90116da/source/page.ts#L815
     */
    articleFeaturedImage: (title) => {
      return pipe(
        restClientTask<{ items: { type: string; srcset: any[] }[] }>({
          url: `/page/media-list/${title.replace(/ /g, "_")}`,
        }),
        TE.map(({ items }) => {
          return pipe(
            items.filter((i) => i.type === "image"),
            fp.A.head,
            fp.O.chainNullableK((r) => r.srcset?.[0]?.src),
            fp.O.map((url) => ensureHTTPS(url)),
            fp.O.toUndefined,
          );
        }),
        TE.mapLeft(toMWError),
      );
    },
  };
};
