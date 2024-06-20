import { type Endpoints } from "@liexp/shared/lib/endpoints";
import { type APIError } from "@liexp/shared/lib/io/http/Error/APIError.js";
import { type http } from "@liexp/shared/lib/io/index.js";
import { type EndpointsRESTClient } from "@liexp/shared/lib/providers/EndpointsRESTClient/EndpointsRESTClient";
import {
  useMutation,
  type QueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { pipe } from "fp-ts/lib/function.js";

export const createEventFromLink = (
  api: EndpointsRESTClient<Endpoints>,
  qc: QueryClient,
): UseMutationResult<any, APIError, { url: string }> =>
  useMutation({
    mutationFn: (params) =>
      pipe(
        api.Endpoints.Event.Custom.CreateFromLink({
          Body: {
            url: params.url,
          },
        }),
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });

export const getEventFromLink = (
  api: EndpointsRESTClient<Endpoints>,
): UseMutationResult<any, APIError, { url: string }> =>
  useMutation({
    mutationFn: (params) =>
      pipe(
        api.Endpoints.Event.Custom.GetFromLink({
          Query: {
            url: params.url as any,
          },
        }),
      ),
  });

export const createEventSuggestion = (
  api: EndpointsRESTClient<Endpoints>,
): UseMutationResult<
  any,
  APIError,
  http.EventSuggestion.CreateEventSuggestion
> =>
  useMutation({
    mutationFn: (params) =>
      pipe(
        api.Endpoints.Event.Custom.CreateSuggestion({
          Body: params as any,
        }),
      ),
  });

export const getURLMetadata = (
  api: EndpointsRESTClient<Endpoints>,
): UseMutationResult<any, APIError, { url: string }> =>
  useMutation({
    mutationFn: (params) =>
      api.Endpoints.OpenGraph.Custom.GetMetadata({
        Query: {
          url: params.url as any,
          type: "Link",
        },
      }).then((r) => r.data),
  });
