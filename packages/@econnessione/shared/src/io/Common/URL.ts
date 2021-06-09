import * as E from "fp-ts/lib/Either";
import * as IOE from "fp-ts/lib/IOEither";
import { pipe } from "fp-ts/lib/pipeable";
import * as t from "io-ts";

export interface URLBrand {
  readonly URL: unique symbol;
}

const urlPattern = new RegExp(
  "^(https?:\\/\\/)?" + // protocol
    "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
    "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
    "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
    "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
    "(\\#[-a-z\\d_]*)?$",
  "i"
); // fragment locator

export const URL = t.brand(
  t.string,
  (url): url is t.Branded<string, URLBrand> =>
    pipe(
      IOE.tryCatch(() => urlPattern.test(url), E.toError),
      IOE.chain((result) => (!result ? IOE.left({}) : IOE.right(result))),
      IOE.fold(
        (e) => {
          // eslint-disable-next-line no-console
          console.error("An error occured", e);
          return () => false;
        },
        (match) => () => match
      )
    )(),
  "URL"
);

export type URL = t.TypeOf<typeof URL>;
