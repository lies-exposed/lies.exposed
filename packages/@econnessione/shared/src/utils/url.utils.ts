import * as axios from "axios";
import domino from "domino";
import * as R from "fp-ts/lib/Record";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import metadataParser from "page-metadata-parser";
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

export const fetchMetadata = <E>(
  url: string,
  toError: (e: unknown) => E
): TE.TaskEither<E, any> => {
  return pipe(
    TE.tryCatch(
      () => axios.default.get(url, { responseType: "text" }),
      toError
    ),
    TE.map((data) => data.data),
    TE.map((html) => domino.createWindow(html).document),
    TE.map((dom) => metadataParser.getMetadata(dom, url))
  );
};
