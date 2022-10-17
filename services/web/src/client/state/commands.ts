import { http } from "@liexp/shared/io";
import { APIError } from "@liexp/shared/providers/api.provider";
import { foldTE } from "@liexp/ui/providers/DataProvider";
import * as TE from 'fp-ts/TaskEither';
import { pipe } from "fp-ts/function";
import { useMutation, UseMutationResult } from "react-query";
import { api } from "../api";
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
          url: params.url,
        },
      }),
      foldTE
    )
  );

export const createEventSuggestion = (): UseMutationResult<
  any,
  APIError,
  http.EventSuggestion.EventSuggestion
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
