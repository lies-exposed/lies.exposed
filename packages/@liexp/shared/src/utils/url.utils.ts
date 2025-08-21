import { Schema } from "effect/index";
import * as R from "fp-ts/lib/Record.js";
import { pipe } from "fp-ts/lib/function.js";
import qs from "query-string";
import { URL } from "../io/http/Common/URL.js";

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
    return Schema.decodeSync(URL)(`${cleanURL}?${qs.stringify(cleanQuery)}`);
  }

  return Schema.decodeSync(URL)(cleanURL);
};

const encodeWithSpaceEndpoint = (url: string): string => {
  if (url.startsWith("https://") || url.startsWith("http://")) {
    return url;
  }

  if (url.startsWith("//")) {
    return `https:${url}`;
  }

  return url;
};

export const ensureHTTPProtocol = (url: string): URL => {
  return pipe(encodeWithSpaceEndpoint(url), Schema.decodeSync(URL));
};
