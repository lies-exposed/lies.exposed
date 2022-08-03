import { EventRelations } from "@liexp/shared/helpers/event";
import * as http from "@liexp/shared/io/http";
import { EventTotals } from "@liexp/shared/io/http/Events/SearchEventsQuery";

export const getTitle = (
  e: http.Events.Event,
  relations: EventRelations
): string => {
  switch (e.type) {
    case http.Events.Documentary.DOCUMENTARY.value:
    case http.Events.Patent.PATENT.value:
    case http.Events.ScientificStudy.SCIENTIFIC_STUDY.value:
    case http.Events.Transaction.TRANSACTION.value:
    case http.Events.Uncategorized.UNCATEGORIZED.value:
      return e.payload.title;
    case http.Events.Death.DEATH.value: {
      const victimName =
        relations.actors.find((a) => a.id === e.payload.victim)?.fullName ??
        "unknown";
      return `Death of ${victimName}`;
    }
  }
};

export const getShareMedia = (
  media: http.Media.Media[],
  defaultImage: string
): string => {
  const cover = media.reduce<string | undefined>((cover, m) => {
    if (!cover) {
      if (http.Media.IframeVideoType.is(m.type)) {
        return m.thumbnail;
      } else if (http.Media.MP4Type.is(m.type)) {
        return m.thumbnail;
      } else if (http.Media.ImageType.is(m.type)) {
        return m.thumbnail;
      }
    }
    return cover;
  }, undefined);

  return cover ?? defaultImage;
};



export const getTotal = (
  totals: EventTotals,
  filters: { [K in keyof EventTotals]: boolean }
): number => {
  return (
    (filters.deaths ? totals.deaths : 0) +
    (filters.documentaries ? totals.documentaries : 0) +
    (filters.patents ? totals.patents : 0) +
    (filters.scientificStudies ? totals.scientificStudies : 0) +
    (filters.transactions ? totals.transactions : 0) +
    (filters.uncategorized ? totals.uncategorized : 0)
  );
};

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
