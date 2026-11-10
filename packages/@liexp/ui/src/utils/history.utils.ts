import { pipe } from "fp-ts/lib/function.js";
import qs from "query-string";
import * as React from "react";
import {
  type Location,
  type NavigateFunction,
  useLocation,
  useNavigate,
} from "react-router";

function base64ToBytes(base64: string): Uint8Array {
  const binString = atob(base64);
  return Uint8Array.from(binString, (m) => m.codePointAt(0) ?? 0);
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
  return pipe(base64ToBytes(hash), (bytes) => new TextDecoder().decode(bytes));
};

const parseQuery = (s: string): qs.ParsedQuery =>
  qs.parse(s.replace("?", ""), { arrayFormat: "bracket" });

export const stringifyQuery = (
  search: Record<string, string | string[]>,
): string => qs.stringify(search, { arrayFormat: "bracket" });

export function useRouteQuery<T extends Record<string, unknown>>(
  def?: T,
): Record<string, string | string[]> & T {
  const { search } = useLocation();

  return React.useMemo(
    () => ({ ...def, ...parseQuery(search) }) as Record<string, string | string[]> & T,
    [search],
  );
}

export const queryToHash = <T extends Record<string, unknown>>(q: T): string => {
  return toBase64(toBase64(JSON.stringify(q)));
};

export const hashToQuery = <T extends Record<string, unknown>>(
  h: string | undefined,
): T => {
  return pipe(
    h !== undefined && h !== "" ? fromBase64(fromBase64(h)) : "{}",
    JSON.parse,
  ) as T;
};

export function useQueryFromHash<T extends Record<string, unknown>>(
  hash: string,
): T {
  return React.useMemo(() => hashToQuery<T>(hash), [hash]);
}

interface HistoryWithNavigateTo extends Location {
  navigate: NavigateFunction;
  navigateTo: (path: string, search?: Record<string, string | string[]>) => void;
}

export function useNavigateTo(): HistoryWithNavigateTo {
  const l = useLocation();
  const h = useNavigate();

  return React.useMemo(() => {
    const navigateTo = (
      view: string,
      search?: Record<string, string | string[]>,
    ): void => {
      const query = stringifyQuery(search ?? {});
      void h(`${view}?${query}`);
    };

    return {
      ...l,
      navigate: h,
      navigateTo,
    };
  }, [l.pathname]);
}
