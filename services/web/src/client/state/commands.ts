import { type APIError } from "@liexp/shared/lib/io/http/Error/APIError.js";
import { type http } from "@liexp/shared/lib/io/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { api } from "@liexp/ui/lib/client/api.js";
import {
  useMutation,
  type UseMutationResult,
  type QueryClient,
} from "@tanstack/react-query";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";

export const createEventFromLink = (
  qc: QueryClient,
): UseMutationResult<any, APIError, { url: string }> =>
  useMutation({
    mutationFn: (params) =>
      pipe(
        api.Event.Custom.CreateFromLink({
          Body: {
            url: params.url,
          },
        }),
        throwTE,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });

export const getEventFromLink = (): UseMutationResult<
  any,
  APIError,
  { url: string }
> =>
  useMutation({
    mutationFn: (params) =>
      pipe(
        api.Event.Custom.GetFromLink({
          Query: {
            url: params.url as any,
          },
        }),
        throwTE,
      ),
  });

export const createEventSuggestion = (): UseMutationResult<
  any,
  APIError,
  http.EventSuggestion.CreateEventSuggestion
> =>
  useMutation({
    mutationFn: (params) =>
      pipe(
        api.Event.Custom.CreateSuggestion({
          Body: params,
        }),
        throwTE,
      ),
  });

export const getURLMetadata = (): UseMutationResult<
  any,
  APIError,
  { url: string }
> =>
  useMutation({
    mutationFn: (params) =>
      pipe(
        api.OpenGraph.Custom.GetMetadata({
          Query: {
            url: params.url as any,
            type: "Link",
          },
        }),
        TE.map((d) => d.data),
        throwTE,
      ),
  });
