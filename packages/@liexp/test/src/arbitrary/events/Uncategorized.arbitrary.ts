import * as http from "@liexp/shared/lib/io/http/index.js";
import { Arbitrary } from "effect";
import fc from "fast-check";
import { DateArb } from "../Date.arbitrary.js";
import { CreateKeywordArb, TagArb } from "../Keyword.arbitrary.js";
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
  mediaIds = false,
  keywordIds = false,
}: CreateEventBodyArbOpts = {}): fc.Arbitrary<http.Events.CreateEventPlainBody> =>
  Arbitrary.make(createEventProps).map((b) => ({
    ...b,
    excerpt: undefined,
    body: undefined,
    payload: {
      title: fc.sample(fc.string(), 1)[0],
      actors: fc.sample(UUIDArb),
      groups: fc.sample(UUIDArb),
      groupsMembers: fc.sample(UUIDArb),
      location: undefined,
      endDate: fc.sample(fc.oneof(fc.constant(undefined), DateArb), 1)[0],
    } as any,
    media: fc.sample(
      fc.record({
        location: URLArb,
        description: fc.string(),
      }),
    ) as any,
    links: fc.sample(
      linksIds
        ? fc.oneof(
            fc.record({
              url: URLArb,
              publishDate: DateArb,
            }),
            UUIDArb,
          )
        : fc.record({
            url: URLArb,
            publishDate: DateArb,
          }),
    ) as any,
    keywords: fc.sample(
      keywordIds
        ? CreateKeywordArb
        : fc.record({
            tag: TagArb(),
          }),
      5,
    ) as any,
    date: fc.sample(DateArb, 1)[0],
  }));

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
    type: http.Events.EventTypes.UNCATEGORIZED.Type,
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
