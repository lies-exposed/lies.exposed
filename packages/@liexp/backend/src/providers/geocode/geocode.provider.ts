import { type HTTPProvider } from "@liexp/shared/lib/providers/http/http.provider";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { IOError } from "ts-io-error";

interface GeocodeSearch {
  display_name: string;
  place_id: string;
  lat: string;
  lon: string;
}

export class GeocodeError extends IOError {}

const toGeocodeError = (e: unknown): GeocodeError => {
  return e as any;
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
          api_key: opts.apiKey
        },
      }),
      TE.mapLeft(toGeocodeError),
    );
  };
  return { search };
};
