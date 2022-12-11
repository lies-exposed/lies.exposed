import * as http from "../../io/http";
import { EventRelations } from "./event";
import { getTitle } from './getTitle.helper';


interface EventCommonProps {
  title: string;
  url?: string;
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
      };
    }
    case http.Events.Patent.PATENT.value: {
      return {
        title,
        url: e.payload.source,
      };
    }
    case http.Events.Documentary.DOCUMENTARY.value: {
      return {
        title,
        url: e.payload.website,
      };
    }
    case http.Events.Uncategorized.UNCATEGORIZED.value: {
      return {
        title,
        url: undefined,
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
