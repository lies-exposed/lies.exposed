import { type UUID } from "../../io/http/Common/UUID.js";
import * as http from "../../io/http/index.js";
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
    case http.Events.EventTypes.SCIENTIFIC_STUDY.Type: {
      return {
        title,
        url: e.payload.url,
        date: [e.date],
      };
    }
    case http.Events.EventTypes.PATENT.Type: {
      return {
        title,
        url: e.payload.source,
        date: [e.date],
      };
    }
    case http.Events.EventTypes.DOCUMENTARY.Type: {
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
    case http.Events.EventTypes.UNCATEGORIZED.Type: {
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
