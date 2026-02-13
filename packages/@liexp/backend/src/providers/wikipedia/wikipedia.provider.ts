import { pipe } from "@liexp/core/lib/fp/index.js";
import { type Logger } from "@liexp/core/lib/logger/index.js";
import {
  type AxiosRequestConfig,
  type AxiosInstance,
  type AxiosResponse,
} from "axios";
import * as TE from "fp-ts/lib/TaskEither.js";

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

interface WikiSearchResult {
  pages: Array<{
    id: number;
    key: string;
    title: string;
    description: string | null;
    thumbnail: { url: string } | null;
  }>;
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
      // Use the MediaWiki action API directly with a limited result count
      // instead of client.search() which uses getAll() and fetches ALL results
      const baseUrl = restClient.defaults.baseURL?.replace(
        /\/api\/rest_v1$/,
        "",
      );

      return pipe(
        TE.tryCatch(
          () =>
            restClient.get<WikiSearchResult>(
              `${baseUrl}/w/rest.php/v1/search/page`,
              {
                baseURL: "",
                params: { q: text, limit: 10 },
              },
            ),
          toMWError,
        ),
        TE.map(({ data: { pages } }) =>
          pages.map(
            (p): SearchResult => ({
              ns: 0,
              title: p.title,
              pageid: p.id,
              timestamp: new Date().toISOString(),
            }),
          ),
        ),
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
            fp.O.map((url) => ensureHTTPProtocol(url)),
            fp.O.toUndefined,
          );
        }),
        TE.mapLeft(toMWError),
      );
    },
  };
};
