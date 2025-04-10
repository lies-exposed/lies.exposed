import { type HTTPProvider } from "@liexp/shared/lib/providers/http/http.provider.js";
import { IOError } from "@ts-endpoint/core";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";

interface GeocodeSearch {
  display_name: string;
  place_id: string;
  lat: string;
  lon: string;
}

export class GeocodeError extends IOError {
  name = "GeocodeError";
}

const toGeocodeError = (e: unknown): GeocodeError => {
  if (e instanceof IOError) {
    return e as GeocodeError;
  }

  if (e instanceof Error) {
    return new GeocodeError(e.message, {
      kind: "ServerError",
      status: "500",
      meta: e.stack,
    });
  }

  return new GeocodeError("Unknown error", {
    kind: "ServerError",
    status: "500",
    meta: e,
  });
};

export interface GeocodeProvider {
  search: (q: string) => TE.TaskEither<GeocodeError, GeocodeSearch[]>;
}

interface GeocodeProviderOptions {
  http: HTTPProvider;
  apiKey: string;
}

export const GeocodeProvider = (
  opts: GeocodeProviderOptions,
): GeocodeProvider => {
  const search = (q: string): TE.TaskEither<GeocodeError, GeocodeSearch[]> => {
    return pipe(
      opts.http.get<GeocodeSearch[]>("/search", {
        params: {
          q,
          api_key: opts.apiKey,
        },
      }),
      TE.mapLeft(toGeocodeError),
    );
  };
  return { search };
};
