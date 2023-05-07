import { type http } from "@liexp/shared/lib/io";
import { type APIError } from "@liexp/shared/lib/io/http/Error/APIError";
import { api } from "@liexp/ui/lib/client/api";
import { foldTE } from "@liexp/ui/lib/providers/DataProvider";
import * as TE from 'fp-ts/TaskEither';
import { pipe } from "fp-ts/function";
import { useMutation, type UseMutationResult } from "react-query";
import { queryClient } from "./queries";

export const createEventFromLink = (): UseMutationResult<any, APIError, { url: string }> =>
  useMutation(
    (params) =>
      pipe(
        api.Event.Custom.CreateFromLink({
          Body: {
            url: params.url,
          },
        }),
        foldTE
      ),
    { onSuccess: () => queryClient.invalidateQueries(["events"]) }
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
      foldTE
    )
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
      foldTE
    )
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
      TE.map(d => d.data),
      foldTE
    )
  );
