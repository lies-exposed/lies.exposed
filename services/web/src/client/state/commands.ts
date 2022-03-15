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
