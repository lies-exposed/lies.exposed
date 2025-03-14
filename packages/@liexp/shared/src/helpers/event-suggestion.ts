import * as O from "fp-ts/lib/Option.js";
import { pipe } from "fp-ts/lib/function.js";
import { type Metadata } from "page-metadata-parser";
import { type UUID, uuid } from "../io/http/Common/UUID.js";
import { http } from "../io/index.js";

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
              label: l.image.label ?? l.title ?? l.image.location,
              creator: undefined,
              createdAt: new Date(),
              updatedAt: new Date(),
              deletedAt: undefined,
              featuredInStories: [],
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
      id: uuid(),
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
                type: http.EventSuggestion.EventSuggestionType.members[0].Type,
                event: {
                  ...commonSuggestion,
                  type: http.Events.EventTypes.BOOK.Type,
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
                type: http.EventSuggestion.EventSuggestionType.members[0].Type,
                event: {
                  ...commonSuggestion,
                  type: http.Events.EventTypes.DOCUMENTARY.Type,
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
                type: http.EventSuggestion.EventSuggestionType.members[0].Type,
                event: {
                  ...commonSuggestion,
                  type: http.Events.EventTypes.PATENT.Type,
                  payload: {
                    title: suggestedTitle,
                    source: link.value.id,
                    owners: {
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
                type: http.EventSuggestion.EventSuggestionType.members[0].Type,
                event: {
                  ...commonSuggestion,
                  type: http.Events.EventTypes.SCIENTIFIC_STUDY.Type,
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
        type: http.EventSuggestion.EventSuggestionType.members[0].Type,
        event: {
          ...commonSuggestion,
          type: http.Events.EventTypes.UNCATEGORIZED.Type,
          payload: {
            title: suggestedTitle,
            actors: relations.actors,
            groups: relations.groups,
            groupsMembers: relations.groupsMembers,
            endDate: undefined,
            location: undefined,
          },
        },
      },
    ];
    return suggestions;
  };
