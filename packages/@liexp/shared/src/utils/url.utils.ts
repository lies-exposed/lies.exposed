import * as R from "fp-ts/lib/Record.js";
import { pipe } from "fp-ts/lib/function.js";
import qs from "query-string";
import { type URL } from "../io/http/Common/URL.js";

export const sanitizeURL = (url: URL): URL => {
  const [cleanURL, query] = url.split("?");
  const cleanQuery = pipe(
    qs.parse(query),
    R.filterWithIndex(
      (index) =>
        !["utm_", "fbclid"].some((c) => index.toLowerCase().startsWith(c)),
    ),
  );

  if (!R.isEmpty(cleanQuery)) {
    return `${cleanURL}?${qs.stringify(cleanQuery)}` as URL;
  }

  return cleanURL as URL;
};

export const ensureHTTPS = (url: string): URL => {
  if (url.startsWith("https://") || url.startsWith("http://")) {
    return url as URL;
  }

  if (url.startsWith("//")) {
    return `https:${url}` as URL;
  }

  return `https://${url}` as URL;
};
