import { http } from "@liexp/shared/io";
import { searchEventsQuery } from "@liexp/ui/state/queries/SearchEventsQuery";
import { command } from "avenger";
import { api } from "../api";

export const createEventFromLink = command(
  (params: { url: string }) =>
    api.Event.Custom.CreateFromLink({
      Body: {
        url: params.url,
      },
    }),
  {
    searchEventsQuery,
  }
);

export const getEventFromLink = command((params: { url: string }) =>
  api.Event.Custom.GetFromLink({
    Query: {
      url: params.url,
    },
  })
);

export const createEventSuggestion = command(
  (params: http.Events.EventSuggestion) =>
    api.Event.Custom.CreateSuggestion({
      Body: params,
    })
);

export const getURLMetadata = command((params: { url: string }) =>
  api.OpenGraph.Custom.GetMetadata({
    Query: {
      url: params.url as any,
      type: 'Link'
    },
  })
);
