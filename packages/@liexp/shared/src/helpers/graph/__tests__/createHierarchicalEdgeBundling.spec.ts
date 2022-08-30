import { fc } from "@liexp/core/tests";
import { ActorArb, GroupArb, UncategorizedArb } from "../../../tests";
import { KeywordArb } from "../../../tests/arbitrary/Keyword.arbitrary";
import { createHierarchicalEdgeBundling } from "../createHierarchicalEdgeBundlingData";

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
      }));

      const { graph } = createHierarchicalEdgeBundling({
        events,
        actors: [],
        groups: [],
        hideEmptyRelations: false,
        relation: 'keywords'
      });

      expect(graph.nodes.length).toBe(10);

      const expectedLinksLength = (keywordsCount - 1) * 2;
      expect(graph.links.length).toBe(expectedLinksLength);
    });

    test("Succeeds with all given keywords", () => {
      const keywordsCount = 10;
      const keywords = fc.sample(KeywordArb, keywordsCount);
      const actors = fc.sample(ActorArb, 1);
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
      }));

      const { graph } = createHierarchicalEdgeBundling({
        events,
        actors,
        groups,
        hideEmptyRelations: false,
        relation: 'keywords'
      });

      expect(graph.nodes.length).toBe(2);
      expect(graph.nodes).toMatchObject([
        {
          id: keywords[1].id,
          targets: [keywords[2].id],
        },
        {
          id: keywords[2].id,
          targets: [keywords[1].id],
        },
      ]);

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
      const actors = fc.sample(ActorArb, 1);
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
      }));

      const { graph } = createHierarchicalEdgeBundling({
        events,
        actors,
        groups,
        hideEmptyRelations: true,
        relation: 'keywords'
      });

      expect(graph.nodes.length).toBe(5);
      expect(graph.nodes).toMatchObject([
        {
          id: keywords[8].id,
        },
        {
          id: keywords[4].id,
        },
        {
          id: keywords[2].id,
        },
        {
          id: keywords[0].id,
        },
        {
          id: keywords[6].id,
        },
      ]);

      expect(graph.links.length).toBe(9);
    });
  });
});
