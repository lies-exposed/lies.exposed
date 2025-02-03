import { fc } from "@liexp/test";
import { describe, expect, test } from "vitest";
import { KeywordArb } from "../../../tests/arbitrary/Keyword.arbitrary.js";
import { UncategorizedArb } from "../../../tests/arbitrary/events/Uncategorized.arbitrary.js";
import { ActorArb, GroupArb } from "../../../tests/index.js";
import { createHierarchicalEdgeBundling } from "../createHierarchicalEdgeBundlingData.js";

describe("Create Hierarchy Edge Bundling", () => {
  describe("for keywords", () => {
    test("Succeeds with all given keywords", () => {
      const keywordsCount = 10;
      const keywords = fc.sample(KeywordArb, keywordsCount);
      // const actors = fc.sample(ActorArb, 1);
      // const groups = fc.sample(GroupArb, 1);
      const events = fc.sample(UncategorizedArb, 10).map((e, i) => ({
        ...e,
        payload: {
          ...e.payload,
          groupsMembers: [],
          actors: [],
          groups: [],
        },
        media: [],
        keywords: [keywords[1], keywords[i]],
        links: [],
        socialPosts: [],
      }));

      const { graph } = createHierarchicalEdgeBundling({
        events,
        actors: [],
        groups: [],
        hideEmptyRelations: false,
        relation: "keywords",
      });

      expect(graph.nodes.length).toBe(10);

      const expectedLinksLength = (keywordsCount - 1) * 2;
      expect(graph.links.length).toBe(expectedLinksLength);
    });

    test("Succeeds with all given keywords", () => {
      const keywordsCount = 10;
      const keywords = fc.sample(KeywordArb, keywordsCount);
      const actors = fc.sample(ActorArb, 1).map((a) => ({
        ...a,
        bornOn: new Date(),
      }));
      const groups = fc.sample(GroupArb, 1);
      const events = fc.sample(UncategorizedArb, 10).map((e, i) => ({
        ...e,
        payload: {
          ...e.payload,
          groupsMembers: [],
          actors: [],
          groups: [],
        },
        media: [],
        keywords: [keywords[1], keywords[2]],
        links: [],
        socialPosts: [],
      }));

      const { graph } = createHierarchicalEdgeBundling({
        events,
        actors,
        groups,
        hideEmptyRelations: false,
        relation: "keywords",
      });

      expect(graph.nodes.length).toBe(2);
      expect(
        graph.nodes.sort((a, b) => a.label.localeCompare(b.label)),
      ).toMatchObject(
        [
          {
            id: keywords[1].id,
            label: keywords[1].tag,
            targets: [keywords[2].id],
          },
          {
            id: keywords[2].id,
            label: keywords[2].tag,
            targets: [keywords[1].id],
          },
        ]
          .sort((a, b) => a.label.localeCompare(b.label))
          .map((k) => ({ id: k.id, label: k.label })),
      );

      expect(graph.links.length).toBe(2);
      expect(graph.links).toMatchObject([
        {
          value: 10,
        },
        {
          value: 10,
        },
      ]);
    });

    test("Succeeds with keywords that have links", () => {
      const keywordsCount = 10;
      const keywords = fc.sample(KeywordArb, keywordsCount);
      const actors = fc.sample(ActorArb, 1).map((a) => ({
        ...a,
        bornOn: new Date(),
      }));
      const groups = fc.sample(GroupArb, 1);
      const events = fc.sample(UncategorizedArb, 10).map((e, i) => ({
        ...e,
        payload: {
          ...e.payload,
          groupsMembers: [],
          actors: [],
          groups: [],
        },
        media: [],
        keywords: i % 2 === 0 ? [keywords[0], keywords[i]] : [keywords[i]],
        links: [],
        socialPosts: [],
      }));

      const { graph } = createHierarchicalEdgeBundling({
        events,
        actors,
        groups,
        hideEmptyRelations: true,
        relation: "keywords",
      });

      expect(graph.nodes.length).toBe(5);

      expect(
        graph.nodes.sort((a, b) => a.label.localeCompare(b.label)),
      ).toMatchObject(
        [keywords[0], keywords[2], keywords[4], keywords[6], keywords[8]]
          .sort((a, b) => a.tag.localeCompare(b.tag))
          .map((k) => ({ id: k.id, label: k.tag })),
      );

      expect(graph.links.length).toBe(8);
    });
  });
});
