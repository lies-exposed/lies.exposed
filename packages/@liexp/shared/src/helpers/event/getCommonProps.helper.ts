import { type UUID } from "../../io/http/Common/UUID.js";
import { EVENT_TYPES } from "../../io/http/Events/EventType.js";
import type * as http from "../../io/http/index.js";
import { getTitle } from "./getTitle.helper.js";

export interface EventCommonProps {
  title: string;
  url?: string;
  location?: UUID;
  date?: Date[];
}

export const getEventCommonProps = (
  e: http.Events.Event,
  relations: http.Events.EventRelations,
): EventCommonProps => {
  const title = getTitle(e, relations);
  switch (e.type) {
    case EVENT_TYPES.SCIENTIFIC_STUDY: {
      return {
        title,
        url: e.payload.url,
        date: [e.date],
      };
    }
    case EVENT_TYPES.PATENT: {
      return {
        title,
        url: e.payload.source,
        date: [e.date],
      };
    }
    case EVENT_TYPES.DOCUMENTARY: {
      return {
        title,
        url:
          relations.links.find((l) => l.id === e.payload.website)?.title ??
          relations.links.at(0)?.title ??
          e.payload.website ??
          "no url",
        date: [e.date],
      };
    }
    case EVENT_TYPES.UNCATEGORIZED: {
      return {
        title,
        url: undefined,
        date: e.payload.endDate ? [e.date, e.payload.endDate] : [e.date],
        location: e.payload.location,
      };
    }
    default: {
      return {
        title,
        url: undefined,
      };
    }
  }
};
