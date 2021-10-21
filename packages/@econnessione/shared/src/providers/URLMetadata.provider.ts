import { AxiosInstance } from "axios";
import domino from "domino";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { Metadata } from "page-metadata-parser";

export interface URLMetadataClient {
  fetchMetadata: <E>(
    url: string,
    toError: (e: unknown) => E
  ) => TE.TaskEither<E, Metadata>;
}

interface MakeURLMetadataContext {
  client: AxiosInstance;
  parser: {
    toDOM: (html: string) => Document;
    getMetadata: (dom: Document, url: string) => Metadata;
  };
}

export const MakeURLMetadata = (
  ctx: MakeURLMetadataContext
): URLMetadataClient => {
  const fetchMetadata = <E>(
    url: string,
    toError: (e: unknown) => E
  ): TE.TaskEither<E, Metadata> => {
    return pipe(
      TE.tryCatch(
        () =>
          ctx.client.get<any, { data: string }>(url, { responseType: "text" }),
        toError
      ),
      TE.map((data) => data.data),
      TE.map((html) => domino.createWindow(html).document),
      TE.map((dom) => ctx.parser.getMetadata(dom, url))
    );
  };

  return { fetchMetadata };
};
