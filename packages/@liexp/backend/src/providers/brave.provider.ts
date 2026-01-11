import { fp } from "@liexp/core/lib/fp/index.js";
import type {
  BraveSearch,
  BraveSearchOptions,
  WebSearchApiResponse,
} from "brave-search";
import { SafeSearchLevel } from "brave-search/dist/types.js";
import { type TaskEither } from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { ServerError } from "../errors/index.js";

export interface BraveProvider {
  _client: BraveSearch;
  webSearch: (
    query: string,
    opts?: BraveSearchOptions,
  ) => TaskEither<ServerError, WebSearchApiResponse>;
}

export const GetBraveProvider = (client: BraveSearch): BraveProvider => {
  const webSearch = (query: string, opts?: BraveSearchOptions) => {
    return pipe(
      fp.TE.tryCatch(
        () =>
          client.webSearch(query, {
            result_filter: "web,news",
            safesearch: SafeSearchLevel.Off,
            ...opts,
          }),
        ServerError.fromUnknown,
      ),
    );
  };

  return {
    _client: client,
    webSearch,
  };
};
