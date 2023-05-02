import * as R from "fp-ts/Record";
import { pipe } from "fp-ts/function";
import qs from "query-string";
import { type URL } from "../io/http/Common/URL";

export const sanitizeURL = (url: URL): URL => {
  const [cleanURL, query] = url.split("?");
  const cleanQuery = pipe(
    qs.parse(query),
    R.filterWithIndex(
      (index) =>
        !["utm_", "fbclid"].some((c) => index.toLowerCase().startsWith(c))
    )
  );

  if (!R.isEmpty(cleanQuery)) {
    return `${cleanURL}?${qs.stringify(cleanQuery)}` as URL;
  }

  return cleanURL as URL;
};
