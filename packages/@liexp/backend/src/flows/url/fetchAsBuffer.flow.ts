import { type HTTPError } from "@liexp/shared/lib/providers/http/http.provider.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { type HTTPProviderContext } from "../../context/http.context.js";

export const fetchAsBuffer =
  <C extends HTTPProviderContext>(
    url: string,
  ): ReaderTaskEither<C, HTTPError, ArrayBuffer> =>
  (ctx) => {
    return ctx.http.get<ArrayBuffer>(url, {
      responseType: "arraybuffer",
    });
  };
