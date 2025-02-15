import type * as E from "fp-ts/lib/Either.js";
import * as R from "fp-ts/lib/Record.js";
import * as S from "fp-ts/lib/string.js";
import * as t from "io-ts";
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
    const isUndefined = t.undefined.is(r);
    const isEmptyString = typeof r === "string" && S.Eq.equals(r, "");
    return !isUndefined && !isEmptyString;
  });
};

export const Routes = t.type(
  {
    "dashboards/events": t.strict(
      {
        actors: t.union([t.undefined, t.array(t.string)]),
        groups: t.union([t.undefined, t.array(t.string)]),
        topics: t.union([t.undefined, t.array(t.string)]),
        startDate: t.union([t.undefined, t.string]),
        endDate: t.union([t.undefined, t.string]),
      },
      "EventsRoute",
    ),
  },
  "Routes",
);

export type Routes = t.TypeOf<typeof Routes>;

export const parseSearch = <R extends keyof Routes>(
  l: WindowLocation | undefined,
  route: R,
): E.Either<t.Errors, Routes[R]> => {
  const search =
    l !== undefined
      ? stripInvalid(querystring.parse(l.search, queryStringOpts))
      : {};

  switch (route) {
    case "dashboards/events": {
      const actors = t.string.is(search.actors)
        ? [search.actors]
        : search.actors;
      const groups = t.string.is(search.groups)
        ? [search.groups]
        : search.groups;
      const topics = t.string.is(search.topics)
        ? [search.topics]
        : search.topics;
      return Routes.props[route].decode({ ...search, actors, groups, topics });
    }
  }

  return Routes.props[route].decode(search);
};
