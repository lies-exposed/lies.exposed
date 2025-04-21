import { type ParseResult, Schema } from "effect";
import type * as E from "fp-ts/lib/Either.js";
import * as R from "fp-ts/lib/Record.js";
import * as S from "fp-ts/lib/string.js";
import querystring from "query-string";
import { type Location as WindowLocation } from "react-router";

type ParsedQuery = Record<string, string | boolean | number>;

export const queryStringOpts: querystring.StringifyOptions = {
  arrayFormat: "bracket",
  skipEmptyString: true,
};

export const toQueryParams = (params: ParsedQuery): string => {
  return querystring.stringify(params, queryStringOpts);
};

/**
 * Strip `undefined` and empty string from parsed query object
 *
 * @param query parsed query
 */
const stripInvalid = (query: Record<string, any>): querystring.ParsedQuery => {
  return R.Filterable.filter(query, (r) => {
    const isUndefined = Schema.is(Schema.Undefined)(r);
    const isEmptyString = typeof r === "string" && S.Eq.equals(r, "");
    return !isUndefined && !isEmptyString;
  });
};

export const Routes = Schema.Struct({
  "dashboards/events": Schema.Struct({
    actors: Schema.Union(Schema.Undefined, Schema.Array(Schema.String)),
    groups: Schema.Union(Schema.Undefined, Schema.Array(Schema.String)),
    topics: Schema.Union(Schema.Undefined, Schema.Array(Schema.String)),
    startDate: Schema.Union(Schema.Undefined, Schema.String),
    endDate: Schema.Union(Schema.Undefined, Schema.String),
  }).annotations({
    title: "EventsRoute",
  }),
}).annotations({
  title: "Routes",
});

export type Routes = typeof Routes.Type;

export const parseSearch = <R extends keyof Routes>(
  l: WindowLocation | undefined,
  route: R,
): E.Either<ParseResult.ParseError, Routes[R]> => {
  const search =
    l !== undefined
      ? stripInvalid(querystring.parse(l.search, queryStringOpts))
      : {};

  switch (route) {
    case "dashboards/events": {
      const actors = Schema.is(Schema.String)(search.actors)
        ? [search.actors]
        : search.actors;
      const groups = Schema.is(Schema.String)(search.groups)
        ? [search.groups]
        : search.groups;
      const topics = Schema.is(Schema.String)(search.topics)
        ? [search.topics]
        : search.topics;

      return Schema.decodeUnknownEither(Routes.fields[route])({
        ...search,
        actors,
        groups,
        topics,
      });
    }
  }
};
