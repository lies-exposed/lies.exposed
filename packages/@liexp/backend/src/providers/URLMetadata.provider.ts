import { fp } from "@liexp/core/lib/fp/index.js";
import { type AxiosInstance } from "axios";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
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

export interface MakeURLMetadataContext {
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
      TE.chain((dom) =>
        fp.TE.tryCatch(async () => {
          const { JSDOM } = await import("jsdom");
          return new JSDOM(dom).window.document;
        }, toError),
      ),
      TE.map((dom) => ctx.parser.getMetadata(dom, url, metadataRuleSets)),
    );
  };

  return { fetchHTML, fetchMetadata };
};
