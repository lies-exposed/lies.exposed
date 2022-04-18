import { Buffer } from "buffer";
import { pipe } from "fp-ts/lib/function";
import qs from "query-string";
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const toBase64 = (data: string): string => {
  return Buffer.from(data).toString("base64");
};

const fromBase64 = (hash: string): string => {
  return Buffer.from(hash, "base64").toString();
};

const parseQuery = (s: string): qs.ParsedQuery =>
  qs.parse(s.replace("?", ""), { arrayFormat: "comma" });

export const stringifyQuery = (search: {
  [key: string]: string | string[];
}): string => qs.stringify(search, { arrayFormat: "comma" });

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

export const hashToQuery = (h: string): any => {
  return fromBase64(fromBase64(h));
};

export function useQueryFromHash(hash: string): any {
  return React.useMemo(
    () =>
      pipe(
        hash !== undefined && hash !== "" ? hashToQuery(hash) : "{}",
        JSON.parse
      ),
    [hash]
  );
}

interface HistoryWithNavigateTo {
  navigateTo: (path: string, search?: any) => void;
}

export function useNavigateTo(): HistoryWithNavigateTo {
  const location = useLocation();
  const navigate = useNavigate();

  return React.useMemo(() => {
    const navigateTo = (view: string, search?: any): void => {
      const query = stringifyQuery(search);
      navigate(`${view}?${query}`);
    };

    return {
      navigateTo,
    };
  }, [location.pathname, location.search]);
}
