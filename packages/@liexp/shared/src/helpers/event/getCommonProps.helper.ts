import { type UUID } from "io-ts-types/lib/UUID";
import * as http from "../../io/http";
import { getTitle } from "./getTitle.helper";

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
    case http.Events.EventTypes.SCIENTIFIC_STUDY.value: {
      return {
        title,
        url: e.payload.url,
        date: [e.date],
      };
    }
    case http.Events.EventTypes.PATENT.value: {
      return {
        title,
        url: e.payload.source,
        date: [e.date],
      };
    }
    case http.Events.EventTypes.DOCUMENTARY.value: {
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
    case http.Events.EventTypes.UNCATEGORIZED.value: {
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
