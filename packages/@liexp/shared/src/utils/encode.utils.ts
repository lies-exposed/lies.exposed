import crypto from "crypto-js";

export function hash<S extends Record<string, string> = Record<string, string>>(
  obj: S,
  fields: string[] = Object.keys(obj),
): string {
  const plaincnt = fields.reduce(function (memo, fname) {
    memo += fname + "->" + obj[fname] + ",";
    return memo;
  }, "");
  const sha1sum = crypto.SHA1(plaincnt);
  
  const retval = sha1sum.toString();

  return retval;
}

export interface EncodeUtils<T> {
  hash: (m: T) => string;
}

export type GetEncodeUtils = <
  T,
  S extends Record<string, string> = Record<string, string>,
>(
  f: (m: T) => S,
) => EncodeUtils<T>;

export const GetEncodeUtils: GetEncodeUtils = <
  T,
  S extends Record<string, string> = Record<string, string>,
>(
  f: (m: T) => S,
) => {
  return {
    hash: (o: T): string => {
      return hash(f(o));
    },
  };
};
