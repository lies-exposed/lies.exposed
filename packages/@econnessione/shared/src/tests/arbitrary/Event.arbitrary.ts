import { fc, getArbitrary } from "@econnessione/core/tests";
import * as t from "io-ts";
import * as http from "../../io/http";
import { DateArb } from "./Date.arbitrary";
import { HumanReadableStringArb } from "./HumanReadableString.arbitrary";
import { CreateKeywordArb, TagArb } from "./Keyword.arbitrary";
import { URLArb } from "./URL.arbitrary";
import { propsOmit } from "./utils.arbitrary";

interface CreateEventBodyArbOpts {
  linksIds?: boolean;
  mediaIds?: boolean;
  keywordIds?: boolean;
}
export const CreateEventBodyArb = ({
  linksIds = false,
  mediaIds = false,
  keywordIds = false,
}: CreateEventBodyArbOpts = {}): fc.Arbitrary<http.Events.Uncategorized.CreateEventBody> =>
  getArbitrary(
    t.strict({
      ...http.Events.Uncategorized.CreateEventBody.type.props,
      actors: t.unknown,
      groups: t.unknown,
      groupsMembers: t.unknown,
      body2: t.unknown,
      links: t.unknown,
      media: t.unknown,
      keywords: t.unknown,
      startDate: t.unknown,
      endDate: t.unknown,
    })
  ).map((b) => ({
    ...b,
    actors: fc.sample(fc.uuidV(4)) as any,
    groups: fc.sample(fc.uuidV(4)) as any,
    groupsMembers: fc.sample(fc.uuidV(4)) as any,
    media: fc.sample(
      fc.record({
        location: URLArb,
        description: fc.string(),
      })
    ) as any,
    links: fc.sample(
      linksIds
        ? fc.oneof(
            fc.record({
              url: URLArb,
              publishDate: DateArb,
            }),
            fc.uuidV(4)
          )
        : fc.record({
            url: URLArb,
            publishDate: DateArb,
          })
    ) as any,
    keywords: fc.sample(
      keywordIds
        ? CreateKeywordArb
        : fc.record({
            tag: TagArb(),
          }),
      5
    ) as any,
    startDate: fc.sample(DateArb, 1)[0],
    endDate: fc.sample(fc.oneof(fc.constant(undefined), DateArb), 1)[0] as any,
    body2: {},
  }));

const plainUncategorized = propsOmit(http.Events.Uncategorized.Uncategorized, [
  "createdAt",
  "updatedAt",
  "media",
  "groups",
  "body2",
  "id",
  "startDate",
  "endDate",
  "location",
  "excerpt",
]);

export const EventArb: fc.Arbitrary<http.Events.Uncategorized.Uncategorized> =
  getArbitrary(
    t.strict({
      ...plainUncategorized,
    })
  ).map((p) => {
    const coordinates = fc.sample(fc.float({ max: 60 }), 2);
    return {
      ...p,
      excerpt: "",
      media: [],
      keywords: [],
      links: fc.sample(fc.uuidV(4)),
      groups: [],
      id: fc.sample(fc.uuidV(4), 1)[0] as any,
      title: fc.sample(HumanReadableStringArb(), 1)[0],
      startDate: fc.sample(
        fc.date({ min: new Date("2010-01-01"), max: new Date() }),
        1
      )[0],
      endDate: fc.sample(
        fc.oneof(
          fc.constant(undefined),
          fc.date({ min: new Date("2010-01-01"), max: new Date() })
        ),
        1
      )[0],
      location: {
        type: "Point",
        coordinates: [coordinates[0], coordinates[1]],
      },
      body2: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

export const UncategorizedV2Arb: fc.Arbitrary<http.Events.UncategorizedV2> =
  getArbitrary(
    t.strict({
      ...propsOmit(http.Events.UncategorizedV2, [
        "id",
        "date",
        "excerpt",
        "payload",
        "media",
        "keywords",
        "createdAt",
        "updatedAt",
      ]),
    })
  ).map((u) => ({
    ...u,
    id: fc.sample(fc.uuid(), 1)[0] as any,
    date: fc.sample(DateArb, 1)[0],
    createdAt: fc.sample(DateArb, 1)[0],
    updatedAt: fc.sample(DateArb, 1)[0],
    excerpt: "",
    media: fc.sample(fc.uuid(), 5) as any[],
    keywords: fc.sample(fc.uuid(), 5) as any[],
    payload: {
      title: fc.sample(fc.string(), 1)[0],
      location: undefined,
      body: {},
      actors: fc.sample(fc.uuid(), 5) as any[],
      groups: fc.sample(fc.uuid(), 5) as any[],
      links: fc.sample(fc.uuid(), 5) as any[],
      groupsMembers: fc.sample(fc.uuid(), 5) as any[],
      endDate: undefined,
    },
  }));
