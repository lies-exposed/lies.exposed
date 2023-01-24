import * as R from "fp-ts/Record";
import { pipe } from "fp-ts/function";
import * as qs from "qs";
import { type URL } from "../io/http/Common/URL";

export const sanitizeURL = (url: URL): URL => {
  const [cleanURL, query] = url.split("?");
  const cleanQuery = pipe(
    qs.parse(query),
    R.filterWithIndex((index) => [].some((c) => c === index))
  );

  if (!R.isEmpty(cleanQuery)) {
    return `${cleanURL}?${qs.stringify(cleanQuery)}` as URL;
  }

  return cleanURL as URL;
};
