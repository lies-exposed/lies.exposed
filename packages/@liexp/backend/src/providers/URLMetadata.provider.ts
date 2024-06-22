import { type AxiosInstance } from "axios";
import domino from "domino";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { type Metadata, metadataRuleSets } from "page-metadata-parser";

metadataRuleSets.date = {
  rules: [
    [
      'meta[name="article:published_time"]',
      (element: Element) => element.getAttribute("content"),
    ],
    ["time", (el: Element) => el.getAttribute("datetime")],
  ],
};

export interface URLMetadataClient {
  fetchMetadata: <E>(
    url: string,
    opts: any,
    toError: (e: unknown) => E,
  ) => TE.TaskEither<E, Metadata>;
  fetchHTML: <E>(
    url: string,
    opts: any,
    toError: (e: unknown) => E,
  ) => TE.TaskEither<E, string>;
}

interface MakeURLMetadataContext {
  client: AxiosInstance;
  parser: {
    getMetadata: (dom: Document, url: string, opts?: any) => Metadata;
  };
}

export const MakeURLMetadata = (
  ctx: MakeURLMetadataContext,
): URLMetadataClient => {
  const fetchHTML = <E>(
    url: string,
    opts: any,
    toError: (e: unknown) => E,
  ): TE.TaskEither<E, string> => {
    return pipe(
      TE.tryCatch(
        () =>
          ctx.client.get<any, { data: string }>(url, { responseType: "text" }),
        toError,
      ),
      TE.map((data) => data.data),
    );
  };

  const fetchMetadata = <E>(
    url: string,
    opts: any,
    toError: (e: unknown) => E,
  ): TE.TaskEither<E, Metadata> => {
    return pipe(
      fetchHTML(url, opts, toError),
      TE.map((dom) =>
        ctx.parser.getMetadata(
          domino.createWindow(dom).document,
          url,
          metadataRuleSets,
        ),
      ),
    );
  };

  return { fetchHTML, fetchMetadata };
};
