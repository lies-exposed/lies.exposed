import { pipe } from "@liexp/core/lib/fp/index.js";
import { type URL } from "@liexp/shared/lib/io/http/Common/URL.js";
import { type HTTPError } from "@liexp/shared/lib/providers/http/http.provider.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type ServerContext } from "../../context/context.type.js";

export interface MediaAccessibilityResult {
  accessible: boolean;
  method: "http";
  error?: string;
}

/**
 * Check if media at the given URL is accessible and downloadable.
 * Uses HTTP GET request to verify accessibility.
 */
export const checkMediaAccessibility =
  (url: URL) =>
  (ctx: ServerContext): TE.TaskEither<HTTPError, MediaAccessibilityResult> => {
    return pipe(
      TE.tryCatch(
        async () => {
          // Attempt to fetch the media URL with a timeout
          await ctx.http.get<unknown>(url, {
            timeout: 10000, // 10 second timeout
            maxRedirects: 5,
          })();
          const result: MediaAccessibilityResult = {
            accessible: true,
            method: "http" as const,
          };
          return result;
        },
        (error): HTTPError => {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error occurred";
          return {
            name: "HTTPError",
            message: errorMessage,
            status: 500,
          } as HTTPError;
        },
      ),
    );
  };
