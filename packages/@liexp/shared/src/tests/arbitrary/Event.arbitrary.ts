import { propsOmit } from "@liexp/core/lib/io/utils.js";
import { fc, getArbitrary } from "@liexp/test";
import * as t from "io-ts";
import * as http from "../../io/http/index.js";
import { DateArb } from "./Date.arbitrary.js";
import { CreateKeywordArb, TagArb } from "./Keyword.arbitrary.js";
import { URLArb } from "./URL.arbitrary.js";
import { UUIDArb } from "./common/UUID.arbitrary.js";

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
    excerpt: undefined,
    body: undefined,
    payload: {
      title: "",
      actors: fc.sample(UUIDArb),
      groups: fc.sample(UUIDArb),
      groupsMembers: fc.sample(UUIDArb),
      location: undefined,
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

export type UncategorizedArbType = Omit<
  http.Events.Uncategorized.Uncategorized,
  "socialPosts"
> & {
  socialPosts?: any[];
};
export const UncategorizedArb: fc.Arbitrary<UncategorizedArbType> =
  getArbitrary(t.strict(uncategorizedProps)).map((u) => ({
    ...u,
    id: fc.sample(UUIDArb, 1)[0],
    type: http.Events.EventTypes.UNCATEGORIZED.value,
    date: fc.sample(DateArb, 1)[0],
    createdAt: fc.sample(DateArb, 1)[0],
    updatedAt: fc.sample(DateArb, 1)[0],
    deletedAt: undefined,
    excerpt: undefined,
    body: undefined,
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
