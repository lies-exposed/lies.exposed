import * as E from "fp-ts/lib/Either";
import * as IOE from "fp-ts/lib/IOEither";
import { pipe } from "fp-ts/lib/pipeable";
import * as t from "io-ts";

export interface URLBrand {
  readonly URL: unique symbol;
}

const urlPattern =
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)/;

export const URL = t.brand(
  t.string,
  (url): url is t.Branded<string, URLBrand> =>
    pipe(
      IOE.tryCatch(() => {
        const urlTest = urlPattern.test(url);
        return urlTest;
      }, E.toError),
      IOE.mapLeft((e) => {
        // eslint-disable-next-line no-console
        console.error("An error occured %O", e);
        return false;
      }),
      IOE.fold(
        (b) => () => b,
        (b) => () => b
      )
    )(),
  "URL"
);

export type URL = t.TypeOf<typeof URL>;
