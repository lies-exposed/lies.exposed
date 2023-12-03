import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";
import { type UUID } from "io-ts-types/lib/UUID";
import { type Metadata } from "page-metadata-parser";
import { http } from "../io";
import { createExcerptValue } from "../slate";
import { uuid } from "../utils/uuid";

export const getSuggestions = (
  m: Metadata,
  link: O.Option<http.Link.Link>,
  media: O.Option<http.Media.Media>,
  relations: http.Events.EventRelationIds,
): http.EventSuggestion.CreateEventSuggestion[] => {
  const urlDate = m.date ? new Date(m.date) : new Date();

  const suggestedTitle = pipe(
    O.fromNullable(m.title),
    O.alt(() =>
      pipe(
        link,
        O.map((l) => l.title ?? ""),
      ),
    ),
    O.getOrElse(() => m.title),
  );

  const suggestedExcerpt = m.description
    ? createExcerptValue(m.description)
    : undefined;

  const suggestedMedia = pipe(
    link,
    O.chainNullableK((l) => l.image),
    O.alt<any>(() => media),
  );

  const suggestedEventLinks = pipe(
    link,
    O.map((l) => [l.id]),
    O.getOrElse((): any[] => [
      {
        url: m.url,
        publishDate: urlDate.toISOString(),
      },
    ]),
  );
  const commonSuggestion = {
    id: uuid() as any,
    excerpt: suggestedExcerpt,
    body: {},
    draft: true,
    date: urlDate,
    newLinks: suggestedEventLinks,
    media: pipe(
      suggestedMedia,
      O.map((m) => [m.id]),
      O.getOrElse((): UUID[] => []),
    ),
    links: [],
    keywords: relations.keywords,
    socialPosts: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: undefined,
  };

  const suggestions: http.EventSuggestion.CreateEventSuggestion[] = [
    ...pipe(
      link,
      O.map((l) => [
        {
          type: http.EventSuggestion.EventSuggestionType.types[0].value,
          event: {
            ...commonSuggestion,
            type: http.Events.EventTypes.PATENT.value,
            payload: {
              title: suggestedTitle,
              source: l.id,
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
            type: http.Events.EventTypes.SCIENTIFIC_STUDY.value,
            payload: {
              title: suggestedTitle,
              url: l.id,
              image: pipe(
                suggestedMedia,
                O.map((m) => m.id),
                O.toUndefined,
              ),
              publisher: undefined,
              authors: [],
            },
          },
        },
      ]),
      O.getOrElse((): http.EventSuggestion.CreateEventSuggestion[] => []),
    ),
    {
      type: http.EventSuggestion.EventSuggestionType.types[0].value,
      event: {
        ...commonSuggestion,
        type: http.Events.EventTypes.DOCUMENTARY.value,
        payload: {
          title: suggestedTitle,
          website: pipe(
            link,
            O.map((l) => l.id),
            O.toUndefined,
          ),
          media: pipe(
            suggestedMedia,
            O.map((m) => m.id),
            O.toNullable,
          ),
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
        type: http.Events.EventTypes.UNCATEGORIZED.value,
        payload: {
          title: suggestedTitle,
          actors: relations.actors,
          groups: relations.groups,
          groupsMembers: relations.groupsMembers,
          endDate: undefined as any,
          location: undefined as any,
        },
      },
    },
  ];
  return suggestions;
};
