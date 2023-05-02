import { type WindowLocation } from "@reach/router";
import * as E from "fp-ts/Either";
import * as R from "fp-ts/Record";
import { pipe } from "fp-ts/function";
import * as S from "fp-ts/string";
import * as t from "io-ts";
import qs from "query-string";

const queryStringOpts: qs.ParseOptions = {
  arrayFormat: "comma",
};

/**
 * Strip `undefined` and empty string from parsed query object
 *
 * @param query parsed query
 */
const stripInvalid = (query: Record<string, any>): qs.ParsedQuery => {
  return R.record.filter(query, (r) => {
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
      "EventsRoute"
    ),
  },
  "Routes"
);

export type Routes = t.TypeOf<typeof Routes>;

export const parseSearch = <R extends keyof Routes>(
  l: WindowLocation | undefined,
  route: R
): E.Either<t.Errors, Routes[R]> => {
  const search =
    l !== undefined
      ? stripInvalid(
          qs.parse(l.search.replace("?", ""), queryStringOpts)
        )
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

export const updateSearch =
  <R extends keyof Routes>(route: R) =>
  (
    l: WindowLocation | undefined,
    update: Partial<Routes[R]>
  ): E.Either<t.Errors, string> => {
    return pipe(
      parseSearch(l, route),
      E.map((search) => Object.assign(search, update)),
      E.map(stripInvalid),
      E.map(
        (search) =>
          `/${route}?${qs.stringify(search, queryStringOpts)}`
      )
    );
  };
