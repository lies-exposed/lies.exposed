import * as http from "@liexp/shared/io/http";
import { EventTotals } from "@liexp/shared/io/http/Events/SearchEventsQuery";
import { uuid } from "@liexp/shared/utils/uuid";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { Metadata } from "page-metadata-parser";
import { createExcerptValue } from "../components/Common/Editor";

export const getTitle = (e: http.Events.Event): string => {
  switch (e.type) {
    case http.Events.Documentary.DOCUMENTARY.value:
    case http.Events.Patent.PATENT.value:
    case http.Events.ScientificStudy.SCIENTIFIC_STUDY.value:
    case http.Events.Transaction.TRANSACTION.value:
    case http.Events.Uncategorized.UNCATEGORIZED.value:
      return e.payload.title;
    case http.Events.Death.DEATH.value:
      return `Death of ${e.payload.victim}`;
  }
};

export const getShareMedia = (
  media: http.Media.Media[],
  defaultImage: string
): string => {
  return (
    media.find((m) => http.Media.ImageType.is(m.type))?.location ?? defaultImage
  );
};

export const getSuggestions = (
  m: Metadata,
  link: O.Option<http.Link.Link>
): http.Events.EventSuggestion[] => {
  const urlDate = m.date ? new Date(m.date) : new Date();

  const suggestedTitle = pipe(
    O.fromNullable(m.title),
    O.alt(() =>
      pipe(
        link,
        O.map((l) => l.title ?? "")
      )
    ),
    O.getOrElse(() => m.title)
  );

  const suggestedExcerpt = m.description
    ? createExcerptValue(m.description)
    : undefined;

  const suggestedEventLinks = pipe(
    link,
    O.map((l) => [l.id]),
    O.getOrElse((): any[] => [
      {
        url: m.url,
        publishDate: urlDate.toISOString(),
      },
    ])
  );
  const commonSuggestion = {
    id: uuid() as any,
    excerpt: suggestedExcerpt,
    body: {},
    draft: true,
    date: urlDate,
    media: [],
    links: suggestedEventLinks,
    keywords: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: undefined,
  };

  const suggestions: http.Events.EventSuggestion[] = [
    {
      type: http.Events.EventSuggestionType.types[0].value,
      event: {
        ...commonSuggestion,
        type: http.Events.Documentary.DOCUMENTARY.value,
        payload: {
          title: suggestedTitle,
          website: m.url,
          media: uuid() as any,
          authors: {
            actors: [],
            groups: [],
          },
          subjects: {
            actors: [],
            groups: [],
          },
        },
      },
    },
    {
      type: http.Events.EventSuggestionType.types[0].value,
      event: {
        ...commonSuggestion,
        type: http.Events.Patent.PATENT.value,
        payload: {
          title: suggestedTitle,
          source: m.url as any,
          owners: {
            actors: [],
            groups: [],
          } as any,
        },
      },
    },
    {
      type: http.Events.EventSuggestionType.types[0].value,
      event: {
        ...commonSuggestion,
        type: http.Events.ScientificStudy.SCIENTIFIC_STUDY.value,
        payload: {
          title: suggestedTitle,
          url: m.url as any,
          image: m.image,
          publisher: undefined,
          authors: [],
        },
      },
    },
    {
      type: http.Events.EventSuggestionType.types[0].value,
      event: {
        ...commonSuggestion,
        type: http.Events.Death.DEATH.value,
        payload: {
          victim: uuid() as any,
          location: undefined as any,
        },
      },
    },
    {
      type: http.Events.EventSuggestionType.types[0].value,
      event: {
        ...commonSuggestion,
        type: http.Events.Uncategorized.UNCATEGORIZED.value,
        payload: {
          title: suggestedTitle,
          actors: [],
          groups: [],
          groupsMembers: [],
          endDate: undefined as any,
          location: undefined as any,
        },
      },
    },
  ];
  return suggestions;
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

export const getEventCommonProps = (e: http.Events.Event): EventCommonProps => {
  const title = getTitle(e);
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
