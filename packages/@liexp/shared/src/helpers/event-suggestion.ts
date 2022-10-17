import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";
import { Metadata } from "page-metadata-parser";
import { http } from "../io";
import { createExcerptValue } from "../slate";
import { uuid } from "../utils/uuid";

export const getSuggestions = (
  m: Metadata,
  link: O.Option<http.Link.Link>,
  media: O.Option<http.Media.Media>
): http.EventSuggestion.EventSuggestion[] => {
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
    newLinks: suggestedEventLinks,
    media: [],
    links: [],
    keywords: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: undefined,
  };

  const suggestions: http.EventSuggestion.EventSuggestion[] = [
    {
      type: http.EventSuggestion.EventSuggestionType.types[0].value,
      event: {
        ...commonSuggestion,
        type: http.Events.Documentary.DOCUMENTARY.value,
        payload: {
          title: suggestedTitle,
          website: m.url,
          media: pipe(
            media,
            O.map((m) => m.id),
            O.toNullable
          ) as any,
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
      type: http.EventSuggestion.EventSuggestionType.types[0].value,
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
      type: http.EventSuggestion.EventSuggestionType.types[0].value,
      event: {
        ...commonSuggestion,
        type: http.Events.ScientificStudy.SCIENTIFIC_STUDY.value,
        payload: {
          title: suggestedTitle,
          url: m.url as any,
          image: m.image ?? undefined,
          publisher: undefined,
          authors: [],
        },
      },
    },
    {
      type: http.EventSuggestion.EventSuggestionType.types[0].value,
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
      type: http.EventSuggestion.EventSuggestionType.types[0].value,
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
