import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { type APIError } from "@liexp/shared/lib/io/http/Error/APIError.js";
import { type http } from "@liexp/shared/lib/io/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { type IOError } from "@ts-endpoint/core";
import { type EndpointsRESTClient } from "@ts-endpoint/react-admin";

export const getEventFromLink = (
  api: EndpointsRESTClient<Endpoints>,
): UseMutationResult<any, APIError, { url: string }> =>
  useMutation({
    mutationFn: (params) =>
      pipe(
        api.Endpoints.Event.Custom.GetFromLink({
          Query: {
            url: params.url,
            _start: null,
            _end: null,
          },
        }),
        throwTE,
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
        throwTE,
      ),
  });

export const getURLMetadata = (
  api: EndpointsRESTClient<Endpoints>,
): UseMutationResult<any, IOError, { url: string }> =>
  useMutation({
    mutationFn: (params) =>
      pipe(
        api.Endpoints.OpenGraph.Custom.GetMetadata({
          Query: {
            url: params.url as any,
            type: "Link",
          },
        }),
        fp.TE.map((r) => r.data),
        throwTE,
      ),
  });
