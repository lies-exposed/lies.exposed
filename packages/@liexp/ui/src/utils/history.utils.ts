import { pipe } from "fp-ts/lib/function.js";
import qs from "query-string";
import * as React from "react";
import {
  type Location,
  type NavigateFunction,
  useLocation,
  useNavigate,
} from "react-router-dom";

function base64ToBytes(base64: string): Uint8Array {
  const binString = atob(base64);
  return Uint8Array.from(binString, (m) => m.codePointAt(0) as any);
}

function bytesToBase64(bytes: Uint8Array): string {
  const binString = Array.from(bytes, (byte) =>
    String.fromCodePoint(byte),
  ).join("");
  return btoa(binString);
}

const toBase64 = (data: string): string => {
  return pipe(new TextEncoder().encode(data), bytesToBase64);
};

const fromBase64 = (hash: string): string => {
  return pipe(base64ToBytes(hash), new TextDecoder().decode);
};

const parseQuery = (s: string): qs.ParsedQuery =>
  qs.parse(s.replace("?", ""), { arrayFormat: "bracket" });

export const stringifyQuery = (
  search: Record<string, string | string[]>,
): string => qs.stringify(search, { arrayFormat: "bracket" });

export function useRouteQuery(def?: any): any {
  const { search } = useLocation();

  return React.useMemo(() => ({ ...def, ...parseQuery(search) }), [search]);
}

export const queryToHash = (q: any): string => {
  return toBase64(toBase64(JSON.stringify(q)));
};

export const hashToQuery = (h: string | undefined): any => {
  return pipe(
    h !== undefined && h !== "" ? fromBase64(fromBase64(h)) : "{}",
    JSON.parse,
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
