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

export interface SearchResult {
  ns: number;
  title: string;
  pageid: number;
  timestamp: string;
}

export interface WikipediaProvider {
  search: (text: string) => TE.TaskEither<Error, SearchResult[]>;
  articleSummary: (title: string) => TE.TaskEither<Error, RESTArticleSummary>;
}

interface WikiSearchResult {
  pages: {
    id: number;
    key: string;
    title: string;
    description: string | null;
    thumbnail: { url: string } | null;
  }[];
}

interface WikipediaProviderOpts {
  logger: Logger;
  restClient: AxiosInstance;
}

const toMWError = (e: unknown): Error => {
  return e as Error;
};

export const WikipediaProvider = ({
  logger,
  restClient,
}: WikipediaProviderOpts): WikipediaProvider => {
  logger.debug.log("Wikipedia provider created");

  const restClientTask = <R, C = any>(params: AxiosRequestConfig<C>) =>
    pipe(
      TE.tryCatch(
        () => restClient<any, AxiosResponse<R, C>, C>(params),
        toMWError,
      ),
      TE.map((res) => res.data),
    );

  return {
    search: (text) => {
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
    articleSummary: (title) => {
      return pipe(
        restClientTask({
          url: `/page/summary/${title.replace(/ /g, "_")}`,
        }),
      );
    },
  };
};
