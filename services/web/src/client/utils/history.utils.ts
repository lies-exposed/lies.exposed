import { Buffer } from "buffer";
import { pipe } from "fp-ts/function";
import qs from "query-string";
import React from "react";
import {
  NavigateFunction,
  useLocation,
  useNavigate,
  Location,
} from "react-router";

const toBase64 = (data: string): string => {
  return Buffer.from(data).toString("base64");
};

const fromBase64 = (hash: string): string => {
  return Buffer.from(hash, "base64").toString();
};

const parseQuery = (s: string): qs.ParsedQuery =>
  qs.parse(s.replace("?", ""), { arrayFormat: "bracket" });

export const stringifyQuery = (search: Record<string, string | string[]>): string => qs.stringify(search, { arrayFormat: "bracket" });

export function useRouteQuery<Q = any>(): qs.ParsedQuery<Q> {
  const { search } = useLocation();

  return React.useMemo(
    () => parseQuery(search) as any as qs.ParsedQuery<Q>,
    [search]
  );
}

export const queryToHash = (q: any): string => {
  return toBase64(toBase64(JSON.stringify(q)));
};

export const hashToQuery = (h: string | undefined): any => {
  return pipe(
    h !== undefined && h !== "" ? fromBase64(fromBase64(h)) : "{}",
    JSON.parse
  );
};

export function useQueryFromHash(hash: string): any {
  return React.useMemo(() => hashToQuery(hash), [hash]);
}

interface HistoryWithNavigateTo extends Location {
  navigate: NavigateFunction;
  navigateTo: (path: string, search?: any) => void;
}

export function useNavigateTo(): HistoryWithNavigateTo {
  const l = useLocation();
  const h = useNavigate();

  return React.useMemo(() => {
    const navigateTo = (view: string, search?: any): void => {
      const query = stringifyQuery(search);
      h(`${view}?${query}`);
    };

    return {
      ...l,
      navigate: h,
      navigateTo,
    };
  }, [l.pathname]);
}
