import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";
import { type UUID } from "io-ts-types/lib/UUID.js";
import { type Metadata } from "page-metadata-parser";
import { http } from "../io/index.js";
import { uuid } from "../utils/uuid.js";

export const getSuggestions =
  (createExcerptValue: (b: string) => Promise<any>) =>
  async (
    m: Metadata,
    link: O.Option<http.Link.Link>,
    media: O.Option<http.Media.Media>,
    relations: http.Events.EventRelationIds,
  ): Promise<http.EventSuggestion.CreateEventSuggestion[]> => {
    const urlDate = m.date ? new Date(m.date) : new Date();

    const suggestedTitle = pipe(
      O.fromNullable(m.title),
      O.alt(() =>
        pipe(
          link,
          O.map((l) => l.title ?? ""),
        ),
      ),
      O.alt(() =>
        pipe(
          media,
          O.chainNullableK((m) => m.label),
        ),
      ),
      O.getOrElse(() => m.title),
    );

    const suggestedExcerpt = m.description
      ? await createExcerptValue(m.description)
      : undefined;

    const suggestedMedia = pipe(
      link,
      O.chainNullableK((l) =>
        l.image
          ? {
              ...l.image,
              creator: undefined,
              createdAt: new Date(),
              updatedAt: new Date(),
              deletedAt: undefined,
              featuredIn: [],
              socialPosts: [],
            }
          : null,
      ),
      O.alt(() => media),
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
      events: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: undefined,
    };

    const suggestions: http.EventSuggestion.CreateEventSuggestion[] = [
      ...pipe({ link, media: suggestedMedia }, ({ link, media }) => [
        ...(O.isSome(media)
          ? [
              // Book
              {
                type: http.EventSuggestion.EventSuggestionType.types[0].value,
                event: {
                  ...commonSuggestion,
                  type: http.Events.EventTypes.BOOK.value,
                  payload: {
                    title: suggestedTitle,
                    media: {
                      pdf: media.value.id,
                      audio: undefined,
                    },
                    publisher: undefined,
                    authors: [],
                  },
                },
              },
              // Documentary
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
                    media: media.value.id,
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
            ]
          : []),
        ...(O.isSome(link)
          ? [
              {
                type: http.EventSuggestion.EventSuggestionType.types[0].value,
                event: {
                  ...commonSuggestion,
                  type: http.Events.EventTypes.PATENT.value,
                  payload: {
                    title: suggestedTitle,
                    source: link.value.id,
                    owners: {
                      actors: [],
                      groups: [],
                    } as any,
                  },
                },
              },
            ]
          : []),
        ...(O.isSome(link)
          ? [
              {
                type: http.EventSuggestion.EventSuggestionType.types[0].value,
                event: {
                  ...commonSuggestion,
                  type: http.Events.EventTypes.SCIENTIFIC_STUDY.value,
                  payload: {
                    title: suggestedTitle,
                    url: link.value.id,
                    image: pipe(
                      media,
                      O.map((m) => m.id),
                      O.toUndefined,
                    ),
                    publisher: undefined,
                    authors: [],
                  },
                },
              },
            ]
          : []),
      ]),
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
