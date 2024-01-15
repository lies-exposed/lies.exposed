import { propsOmit } from "@liexp/core/lib/io/utils.js";
import { fc, getArbitrary } from "@liexp/test";
import * as t from "io-ts";
import * as http from "../../io/http/index.js";
import { DateArb } from "./Date.arbitrary.js";
import { CreateKeywordArb, TagArb } from "./Keyword.arbitrary.js";
import { URLArb } from "./URL.arbitrary.js";

interface CreateEventBodyArbOpts {
  linksIds?: boolean;
  mediaIds?: boolean;
  keywordIds?: boolean;
}

const createEventProps = propsOmit(http.Events.CreateEventBody.types[4], [
  "excerpt",
  "body",
  "date",
  "media",
  "links",
  "keywords",
  "payload",
]);

export const CreateEventBodyArb = ({
  linksIds = false,
  mediaIds = false,
  keywordIds = false,
}: CreateEventBodyArbOpts = {}): fc.Arbitrary<http.Events.CreateEventBody> =>
  getArbitrary(t.strict(createEventProps)).map((b) => ({
    ...b,
    excerpt: {} as any,
    body: {} as any,
    payload: {
      title: "",
      actors: fc.sample(fc.uuidV(4)) as any,
      groups: fc.sample(fc.uuidV(4)) as any,
      groupsMembers: fc.sample(fc.uuidV(4)) as any,
      location: undefined as any,
      endDate: fc.sample(
        fc.oneof(fc.constant(undefined), DateArb),
        1,
      )[0] as any,
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
            fc.uuidV(4),
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

const uncategorizedProps = propsOmit(http.Events.Uncategorized.Uncategorized, [
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
]);

export const UncategorizedArb: fc.Arbitrary<http.Events.Uncategorized.Uncategorized> =
  getArbitrary(t.strict(uncategorizedProps)).map((u) => ({
    ...u,
    id: fc.sample(fc.uuid(), 1)[0] as any,
    type: http.Events.EventTypes.UNCATEGORIZED.value,
    date: fc.sample(DateArb, 1)[0],
    createdAt: fc.sample(DateArb, 1)[0],
    updatedAt: fc.sample(DateArb, 1)[0],
    deletedAt: undefined,
    excerpt: {},
    body: {},
    media: fc.sample(fc.uuid(), 5) as any[],
    keywords: fc.sample(fc.uuid(), 5) as any[],
    links: fc.sample(fc.uuid(), 5) as any[],
    payload: {
      title: fc.sample(fc.string(), 1)[0],
      location: undefined,
      actors: fc.sample(fc.uuid(), 5) as any[],
      groups: fc.sample(fc.uuid(), 5) as any[],
      groupsMembers: fc.sample(fc.uuid(), 5) as any[],
      endDate: undefined,
    },
    socialPosts: undefined,
  }));
