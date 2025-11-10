import type Stream from "stream";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { type URL } from "@liexp/shared/lib/io/http/Common/URL.js";
import { type HTTPError } from "@liexp/shared/lib/providers/http/http.provider.js";
import type * as TE from "fp-ts/lib/TaskEither.js";
import { type HTTPProviderContext } from "../../context/http.context.js";

export const fetchMedia =
  <C extends HTTPProviderContext>(location: URL) =>
  (ctx: C): TE.TaskEither<HTTPError, Stream.Readable> => {
    return pipe(
      ctx.http.get<Stream.Readable>(location, {
        responseType: "stream",
      }),
    );
  };
