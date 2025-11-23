import type Stream from "stream";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { type URL } from "@liexp/shared/lib/io/http/Common/URL.js";
import { type HTTPError } from "@liexp/shared/lib/providers/http/http.provider.js";
import type * as TE from "fp-ts/lib/TaskEither.js";
import { type HTTPProviderContext } from "../../context/http.context.js";

export const fetchMedia =
  <C extends HTTPProviderContext>(location: URL) =>
  (ctx: C): TE.TaskEither<HTTPError, Stream.Readable> => {
    // Extract origin from URL string for referer header
    const urlOrigin = location.split("/").slice(0, 3).join("/");

    return pipe(
      ctx.http.get<Stream.Readable>(location, {
        responseType: "stream",
        headers: {
          // Mimic a real browser to avoid 403 errors from servers blocking bots
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          // Accept common image types and other media
          Accept:
            "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
          // Indicate we accept compressed responses
          "Accept-Encoding": "gzip, deflate, br",
          // Set a referer to appear more legitimate
          Referer: urlOrigin,
        },
        // Increase timeout for slow servers
        timeout: 30000,
        // Follow redirects automatically
        maxRedirects: 5,
        // Validate status codes
        validateStatus: (status) => status >= 200 && status < 300,
      }),
    );
  };
