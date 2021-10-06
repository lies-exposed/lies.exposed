import * as R from "fp-ts/lib/Record";
import { pipe } from "fp-ts/lib/function";
import * as qs from "qs";
import { URL } from "../io/Common";

export const sanitizeURL = (url: URL): URL => {
  const [cleanURL, query] = url.split("?");
  const cleanQuery = pipe(
    qs.parse(query),
    R.filterWithIndex((index) => [].some((c) => c === index))
  );

  return `${cleanURL}?${qs.stringify(cleanQuery)}` as URL;
};
