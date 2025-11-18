import { EVENT_TYPES } from "@liexp/shared/lib/io/http/Events/EventType.js";
import * as http from "@liexp/shared/lib/io/http/index.js";
import { Arbitrary } from "effect";
import fc from "fast-check";
import { DateArb } from "../Date.arbitrary.js";
import { URLArb } from "../URL.arbitrary.js";
import { BlockNoteDocumentArb } from "../common/BlockNoteDocument.arbitrary.js";
import { UUIDArb } from "../common/UUID.arbitrary.js";

interface CreateEventBodyArbOpts {
  linksIds?: boolean;
  mediaIds?: boolean;
  keywordIds?: boolean;
}

const createEventProps = http.Events.CreateEventPlainBody.members[4].omit(
  "excerpt",
  "body",
  "date",
  "media",
  "links",
  "keywords",
  "payload",
);

export const CreateEventBodyArb = ({
  linksIds = false,
  mediaIds: _mediaIds = false,
  keywordIds: _keywordIds = false,
}: CreateEventBodyArbOpts = {}): fc.Arbitrary<http.Events.Uncategorized.CreateEventBody> =>
  Arbitrary.make(createEventProps).map(
    (b) =>
      ({
        ...b,
        type: EVENT_TYPES.UNCATEGORIZED,
        excerpt: undefined,
        body: undefined,
        payload: {
          title: fc.sample(fc.string(), 1)[0],
          actors: fc.sample(UUIDArb),
          groups: fc.sample(UUIDArb),
          groupsMembers: fc.sample(UUIDArb),
          location: null,
          endDate: fc.sample(fc.oneof(fc.constant(null), DateArb), 1)[0],
        },
        media: fc.sample(
          fc.oneof(
            UUIDArb,
            fc.record({
              id: fc.option(UUIDArb, { nil: undefined }),
              location: URLArb,
              label: fc.option(fc.string(), { nil: undefined }),
              description: fc.option(fc.string(), { nil: undefined }),
              thumbnail: fc.option(URLArb, { nil: undefined }),
              extra: fc.constant(undefined),
              type: fc.constantFrom(
                ...http.Media.MediaType.members.map((m) => m.literals[0]),
              ),
              events: fc.constant([]),
              links: fc.constant([]),
              keywords: fc.constant([]),
              areas: fc.constant([]),
            }),
          ),
          3,
        ),
        links: fc.sample(
          linksIds
            ? fc.oneof(
                UUIDArb,
                fc.record({
                  url: URLArb,
                  publishDate: DateArb,
                  title: fc.option(fc.string(), { nil: undefined }),
                  description: fc.option(fc.string(), { nil: undefined }),
                  image: fc.option(URLArb, { nil: undefined }),
                  creator: fc.option(fc.string(), { nil: undefined }),
                  keywords: fc.constant([]),
                }),
              )
            : fc.record({
                url: URLArb,
                publishDate: DateArb,
                title: fc.option(fc.string(), { nil: undefined }),
                description: fc.option(fc.string(), { nil: undefined }),
                image: fc.option(URLArb, { nil: undefined }),
                creator: fc.option(fc.string(), { nil: undefined }),
                keywords: fc.constant([]),
              }),
          2,
        ),
        keywords: fc.sample(UUIDArb, 5),
        date: fc.sample(DateArb, 1)[0],
      }) as unknown as http.Events.Uncategorized.CreateEventBody,
  );

const uncategorizedProps = http.Events.Uncategorized.Uncategorized.omit(
  "id",
  "date",
  "excerpt",
  "body",
  "payload",
  "media",
  "links",
  "keywords",
  "socialPosts",
  "createdAt",
  "updatedAt",
  "deletedAt",
);

export const UncategorizedArb: fc.Arbitrary<http.Events.Uncategorized.Uncategorized> =
  Arbitrary.make(uncategorizedProps).map((u) => ({
    ...u,
    id: fc.sample(UUIDArb, 1)[0],
    type: EVENT_TYPES.UNCATEGORIZED,
    date: fc.sample(DateArb, 1)[0],
    createdAt: fc.sample(DateArb, 1)[0],
    updatedAt: fc.sample(DateArb, 1)[0],
    deletedAt: undefined,
    excerpt: fc.sample(BlockNoteDocumentArb, 1)[0],
    body: fc.sample(BlockNoteDocumentArb, 1)[0],
    media: fc.sample(UUIDArb, 5),
    keywords: fc.sample(UUIDArb, 5),
    links: fc.sample(UUIDArb, 5),
    payload: {
      title: fc.sample(fc.string(), 1)[0],
      location: undefined,
      actors: fc.sample(UUIDArb, 5),
      groups: fc.sample(UUIDArb, 5),
      groupsMembers: fc.sample(UUIDArb, 5),
      endDate: undefined,
    },
    socialPosts: undefined,
  }));
