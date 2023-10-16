import { toSearchEvent } from "@liexp/shared/lib/helpers/event/search-event";
import { type http } from "@liexp/shared/lib/io";
import { type SearchEvent } from "@liexp/shared/lib/io/http/Events";
import { KEYWORDS } from "@liexp/shared/lib/io/http/Keyword";
import {
  type NetworkLink,
  type NetworkType,
} from "@liexp/shared/lib/io/http/Network";
import { UncategorizedArb } from "@liexp/shared/lib/tests";
import { KeywordArb } from "@liexp/shared/lib/tests/arbitrary/Keyword.arbitrary";
import { fc } from "@liexp/test";
import { pipe } from "fp-ts/function";
import { getEventGraph, getRelationLinks } from "../createNetworkGraph.flow";

const getLink = (
  k: any,
  r: NetworkType,
  ev: SearchEvent.SearchEvent[],
): NetworkLink[] => {
  return ev.map((e) => ({
    stroke: `#${k.color}`,
    fill: `#${k.color}`,
    source: k.id,
    sourceType: r,
    target: e.id,
    value: 1,
  }));
};

const searchEventSample = (n: number, o: any): SearchEvent.SearchEvent[] =>
  fc
    .sample(UncategorizedArb, 2)
    .map((e) => ({
      ...e,
      keywords: [],
      links: [],
      media: [],
      ...o,
      payload: {
        ...e.payload,
        ...o.payload,
        actors: [],
        groups: [],
        groupsMembers: [],
      },
    }))
    .map((ev) =>
      toSearchEvent(ev as any, {
        actors: new Map(),
        groups: new Map(),
        keywords: new Map(),
        media: new Map(),
        groupsMembers: new Map(),
      }),
    );

describe.skip("Create Network Graph", () => {
  beforeAll(async () => {});

  describe("getRelationLinks", () => {
    test("return correct links for 1 keyword", () => {
      const keywords = fc.sample(KeywordArb, 1);
      const ev = searchEventSample(5, { keywords });

      const linksAcc = new Map();

      const links = pipe(
        keywords,
        getRelationLinks("keywords", ev[0])(linksAcc),
        getRelationLinks("keywords", ev[1]),
      )(keywords);

      const expectedLinks = new Map();
      expectedLinks.set(
        keywords[0].id,
        getLink(keywords[0], KEYWORDS.value, ev),
      );
      expect(links).toMatchObject(expectedLinks);
    });

    test("return correct links for 2 keywords", () => {
      const keywords = fc.sample(KeywordArb, 2);
      const ev = searchEventSample(5, { keywords });

      const linksAcc = new Map();

      const links = pipe(
        keywords,
        getRelationLinks("keywords", ev[0])(linksAcc),
        getRelationLinks("keywords", ev[1]),
      )(keywords);

      const expectedLinks = new Map();
      expectedLinks.set(
        keywords[0].id,
        getLink(keywords[0], KEYWORDS.value, ev),
      );
      expectedLinks.set(keywords[1].id, []);
      expect(links).toMatchObject(expectedLinks);
    });
  });

  describe("getEventGraph", () => {
    test("return nodes and links with 1 keyword", () => {
      const actors: http.Actor.Actor[] = [];
      const groups: http.Group.Group[] = [];
      const keywords = fc.sample(KeywordArb, 1);
      const events = fc.sample(UncategorizedArb, 5).map((e) => ({
        ...e,
        payload: {
          ...e.payload,
          actors,
          groups,
          groupsMembers: [],
        },
        links: [],
        keywords,
        media: [],
      }));

      const graph = getEventGraph("keywords", [], {
        events,
        actors,
        groups,
        keywords,
        media: [],
        relations: ["keywords"],
        emptyRelations: false,
      });

      const expectedKeywords = new Map();
      expectedKeywords.set(keywords[0].id, keywords[0]);
      const keywordLinks = new Map();

      keywordLinks.set(
        keywords[0].id,
        events.map((e) => ({
          source: e.id,
          target: keywords[0].id,
        })),
      );

      expect(graph).toMatchObject({
        eventNodes: events,
        keywords: expectedKeywords,
        keywordLinks,
        actorLinks: new Map(),
        groupLinks: new Map(),
      });
    });
    test("return nodes and links with 2 keywords", () => {
      const actors: http.Actor.Actor[] = [];
      const groups: http.Group.Group[] = [];
      const keywords = fc.sample(KeywordArb, 2);
      const events = fc.sample(UncategorizedArb, 5).map((e) => ({
        ...e,
        payload: {
          ...e.payload,
          actors,
          groups,
          groupsMembers: [],
        },
        links: [],
        keywords: [keywords[0]],
        media: [],
      }));

      const graph = getEventGraph("keywords", [keywords[0].id], {
        events,
        actors,
        groups,
        keywords,
        media: [],
        relations: [KEYWORDS.value],
        emptyRelations: false,
      });

      const expectedKeywords = new Map();
      expectedKeywords.set(keywords[0].id, keywords[0]);
      expectedKeywords.set(keywords[1].id, keywords[1]);
      const keywordLinks = new Map();

      keywordLinks.set(
        keywords[0].id,
        events.map((e) => ({
          source: e.id,
          target: keywords[0].id,
        })),
      );

      expect(graph).toMatchObject({
        eventNodes: events,
        keywords: expectedKeywords,
        keywordLinks,
        actorLinks: new Map(),
        groupLinks: new Map(),
      });
    });
  });
});
