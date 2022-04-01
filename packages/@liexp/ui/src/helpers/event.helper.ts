import * as http from "@liexp/shared/io/http";
import { EventTotals } from "@liexp/shared/io/http/Events/SearchEventsQuery";
import { uuid } from "@liexp/shared/utils/uuid";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { Metadata } from "page-metadata-parser";
import { createExcerptValue } from "../components/Common/Editor";

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

export const getTotal = (totals: EventTotals): number => {
  return (
    totals.deaths +
    totals.documentaries +
    totals.patents +
    totals.scientificStudies +
    totals.transactions +
    totals.uncategorized
  );
};
