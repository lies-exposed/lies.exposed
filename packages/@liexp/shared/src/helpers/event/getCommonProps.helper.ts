import { type UUID } from 'io-ts-types/lib/UUID';
import * as http from "../../io/http";
import { getTitle } from "./getTitle.helper";
import { type EventRelations } from "./types";

export interface EventCommonProps {
  title: string;
  url?: string;
  location?: UUID;
  date?: Date[];
}

export const getEventCommonProps = (
  e: http.Events.Event,
  relations: EventRelations
): EventCommonProps => {
  const title = getTitle(e, relations);
  switch (e.type) {
    case http.Events.ScientificStudy.SCIENTIFIC_STUDY.value: {
      return {
        title,
        url: e.payload.url,
        date: [e.date]
      };
    }
    case http.Events.Patent.PATENT.value: {
      return {
        title,
        url: e.payload.source,
        date: [e.date]
      };
    }
    case http.Events.Documentary.DOCUMENTARY.value: {
      return {
        title,
        url: e.payload.website,
        date: [e.date]
      };
    }
    case http.Events.Uncategorized.UNCATEGORIZED.value: {
      return {
        title,
        url: undefined,
        date: e.payload.endDate ? [e.date, e.payload.endDate] : [e.date],
        location: e.payload.location
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
