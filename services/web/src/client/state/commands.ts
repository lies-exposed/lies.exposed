import { type http } from "@liexp/shared/lib/io";
import { type APIError } from "@liexp/shared/lib/io/http/Error/APIError";
import { throwTE } from "@liexp/shared/lib/utils/task.utils";
import { api } from "@liexp/ui/lib/client/api";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { useMutation, type UseMutationResult } from "react-query";
import { queryClient } from "./queries";

export const createEventFromLink = (): UseMutationResult<
  any,
  APIError,
  { url: string }
> =>
  useMutation(
    (params) =>
      pipe(
        api.Event.Custom.CreateFromLink({
          Body: {
            url: params.url,
          },
        }),
        throwTE,
      ),
    { onSuccess: () => queryClient.invalidateQueries(["events"]) },
  );

export const getEventFromLink = (): UseMutationResult<
  any,
  APIError,
  { url: string }
> =>
  useMutation((params) =>
    pipe(
      api.Event.Custom.GetFromLink({
        Query: {
          url: params.url as any,
        },
      }),
      throwTE,
    ),
  );

export const createEventSuggestion = (): UseMutationResult<
  any,
  APIError,
  http.EventSuggestion.CreateEventSuggestion
> =>
  useMutation((params) =>
    pipe(
      api.Event.Custom.CreateSuggestion({
        Body: params,
      }),
      throwTE,
    ),
  );

export const getURLMetadata = (): UseMutationResult<
  any,
  APIError,
  { url: string }
> =>
  useMutation((params) =>
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
  );
