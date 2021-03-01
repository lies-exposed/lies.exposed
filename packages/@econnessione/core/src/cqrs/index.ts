import { APIRESTClient } from "@http/APIRESTClient";
import { available, queryStrict } from "avenger";
import { CachedQuery } from "avenger/lib/Query";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import * as t from "io-ts";
import { PathReporter } from "io-ts/lib/PathReporter";
import type {
  GetListParams,
  GetListResult,
  GetOneParams,
  GetOneResult,
} from "react-admin";

// const httpClient = (
//   url: string,
//   options: fetchUtils.Options = {}
// ): Promise<any> => {
//   if (!options.headers) {
//     options.headers = new Headers({ Accept: "application/json" })
//   }
//   // add your own headers here
//   // options.headers.set('X-Custom-Header', 'foobar');
//   console.log(url)
//   return fetchUtils.fetchJson(url, options)
// }

export interface APIError {
  name: "APIError";
  message: string;
  details?: string[];
}

const toError = (e: unknown): APIError => {
  if (e instanceof Error) {
    return {
      name: "APIError",
      message: e.message,
    };
  }
  return {
    name: "APIError",
    message: "An error occured",
  };
};

// const Resources = {
//   areas: Area.AreaMD,
//   pages: Page.PageMD,
//   articles: Article.ArticleMD,
//   actors: Actor.ActorMD,
//   groups: Group.GroupMD,
//   topics: Topic.TopicMD,
//   projects: Project.ProjectMD,
//   events: Events.EventMD,
// };

const liftFetch = <
  C extends t.Any,
  R extends GetOneResult<t.TypeOf<C>> | GetListResult<t.TypeOf<C>>
>(
  lp: () => Promise<R>,
  codec: C
): TE.TaskEither<APIError, R["data"]> => {
  return pipe(
    TE.tryCatch(lp, toError),
    TE.map(({ data }) => data),
    TE.chain((content) => {
      return pipe(
        codec.decode(content),
        E.mapLeft(
          (e): APIError => ({
            name: `APIError`,
            message: "validation failed",
            details: PathReporter.report(E.left(e)),
          })
        ),
        TE.fromEither
      );
    })
  );
};

interface CQRS {
  GetOneQuery: <K extends string, C extends t.Type<any, any, any>>(
    r: K,
    codec: C
  ) => CachedQuery<GetOneParams, APIError, t.TypeOf<C>>;

  GetListQuery: <
    K extends string,
    C extends t.ArrayType<t.Type<any, any, any>>
  >(
    r: K,
    codec: C
  ) => CachedQuery<GetListParams, APIError, Array<t.TypeOf<C>>>;
}

export const GetCQRS = (dataProvider: APIRESTClient): CQRS => {
  return {
    GetOneQuery: <K extends string, C extends t.Type<any, any, any>>(
      r: K,
      codec: C
    ) =>
      queryStrict(
        (params: GetOneParams) =>
          liftFetch(() => dataProvider.getOne<t.TypeOf<C>>(r, params), codec),
        available
      ),
    GetListQuery: <K extends string, C extends t.Type<any, any, any>>(
      r: K,
      codec: C
    ) =>
      queryStrict(
        (params: GetListParams) =>
          liftFetch(() => dataProvider.getList<t.TypeOf<C>>(r, params), codec),
        available
      ),
  };
};
