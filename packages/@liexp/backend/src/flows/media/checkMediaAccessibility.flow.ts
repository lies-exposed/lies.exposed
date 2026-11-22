import { pipe } from "@liexp/core/lib/fp/index.js";
import { type URL } from "@liexp/io/lib/http/Common/URL.js";
import { type HTTPError } from "@liexp/shared/lib/providers/http/http.provider.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type HTTPProviderContext } from "../../context/http.context.js";
import { type LoggerContext } from "../../context/logger.context.js";

interface MediaAccessibilityResult {
  accessible: boolean;
  method: "http";
  error?: string;
}

const MAX_ATTEMPTS = 3;
const BASE_DELAY_MS = 1000;

const isRateLimited = (e: HTTPError): boolean => e.status === 429;

/**
 * Check if media at the given URL is accessible and downloadable.
 *
 * Sends a ranged GET (first byte only) and discards the body, so remote hosts
 * are not asked to stream the whole file. Retries with exponential backoff on
 * HTTP 429; the upstream status is preserved in the returned {@link HTTPError}
 * so callers can tell a throttled source from a broken one.
 */
export const checkMediaAccessibility =
  <C extends HTTPProviderContext & LoggerContext>(url: URL) =>
  (ctx: C): TE.TaskEither<HTTPError, MediaAccessibilityResult> => {
    // Extract origin from URL string for referer header
    const urlOrigin = url.split("/").slice(0, 3).join("/");

    const attempt = (n: number): TE.TaskEither<HTTPError, unknown> =>
      pipe(
        ctx.http.get<unknown>(url, {
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
            // Only probe: ask for the first byte, servers ignoring it return 200
            Range: "bytes=0-0",
          },
          // Increase timeout for slow servers
          timeout: 30000,
          // Follow redirects automatically
          maxRedirects: 5,
          // 206 Partial Content is the expected answer to a Range request
          validateStatus: (status) => status >= 200 && status < 300,
        }),
        TE.orElse((e) => {
          if (isRateLimited(e) && n < MAX_ATTEMPTS) {
            const delay = BASE_DELAY_MS * 2 ** (n - 1);
            ctx.logger.warn.log(
              "Media accessibility check got 429 for %s, retry %d/%d in %dms",
              url,
              n,
              MAX_ATTEMPTS - 1,
              delay,
            );
            return pipe(
              TE.fromTask<void, HTTPError>(
                () => new Promise((resolve) => setTimeout(resolve, delay)),
              ),
              TE.chain(() => attempt(n + 1)),
            );
          }
          return TE.left(e);
        }),
      );

    return pipe(
      attempt(1),
      TE.map((body) => {
        // discard the body: we only care that the resource answered
        if (
          typeof body === "object" &&
          body !== null &&
          "destroy" in body &&
          typeof body.destroy === "function"
        ) {
          body.destroy();
        }
        ctx.logger.debug.log("Media accessibility check succeeded for %s", url);
        const result: MediaAccessibilityResult = {
          accessible: true,
          method: "http" as const,
        };
        return result;
      }),
      TE.mapLeft((error): HTTPError => {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        ctx.logger.error.log(
          "Media accessibility check failed (%s): %s",
          error.status,
          errorMessage,
        );
        // keep the upstream status (e.g. 429, 404) instead of masking as 500
        return error;
      }),
    );
  };
