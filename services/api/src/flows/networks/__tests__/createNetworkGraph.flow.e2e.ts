import { fp } from "@liexp/core/fp";
import { ACTORS } from "@liexp/shared/io/http/Actor";
import { KEYWORDS } from "@liexp/shared/io/http/Keyword";
import { ActorArb, UncategorizedArb } from "@liexp/shared/tests";
import { KeywordArb } from "@liexp/shared/tests/arbitrary/Keyword.arbitrary";
import { throwTE } from "@liexp/shared/utils/task.utils";
import { fc } from "@liexp/test";
import subDays from "date-fns/subDays";
import { AppTest, GetAppTest } from "../../../../test/AppTest";
import { createNetworkGraph } from "../createNetworkGraph.flow";
import { ActorEntity } from "@entities/Actor.entity";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { KeywordEntity } from "@entities/Keyword.entity";

describe("Create Network Graph", () => {
  let Test: AppTest;

  const eventIds: string[] = [];
  const actorIds: string[] = [];
  const keywordIds: string[] = [];

  beforeAll(async () => {
    Test = GetAppTest();
  });

  afterAll(async () => {
    if (eventIds.length) {
      await throwTE(Test.ctx.db.delete(EventV2Entity, eventIds));
    }

    if (keywordIds.length) {
      await throwTE(Test.ctx.db.delete(KeywordEntity, keywordIds));
    }

    if (actorIds.length) {
      await throwTE(Test.ctx.db.delete(ActorEntity, actorIds));
    }
  });

  describe.only("Network of type 'keyword'", () => {
    test('Create event network for type "keyword"', async () => {
      const keywords = fc.sample(KeywordArb, 5);

      await throwTE(Test.ctx.db.save(KeywordEntity, keywords));
      keywordIds.push(...keywords.map((k) => k.id));

      const [keyword, ...otherKeywords] = keywords;

      const events = fc.sample(UncategorizedArb, 10).map((e, i) => ({
        ...e,
        draft: false,
        payload: {
          ...e.payload,
          actors: [],
          groups: [],
          groupsMembers: [],
        },
        media: [],
        links: [],
        date: subDays(new Date(), i),
        createdAt: subDays(new Date(), i),
        keywords: i % 2 === 0 ? [keyword, otherKeywords[0]] : [],
      }));

      await throwTE(Test.ctx.db.save(EventV2Entity, events));

      eventIds.push(...events.map((e) => e.id));

      const graph  = await throwTE(
        createNetworkGraph(Test.ctx)(KEYWORDS.value, keyword.id, {
          groupBy: KEYWORDS.value,
          emptyRelations: fp.O.none,
        })
      );

      expect(graph.nodes).toHaveLength(2 + events.length / 2);
      [
        {
          id: otherKeywords[0].id,
        },
        {
          id: keyword.id,
        },
        ...events.filter((e, i) => i % 2 === 0).map((e) => ({ id: e.id })),
      ].forEach((e) => {
        expect(graph.nodes.find((n) => n.id === e.id)).toMatchObject(e);
      });

      expect(graph.links).toHaveLength(6);
      // expect(graph.links).toMatchObject([
      //   {
      //     source: keyword.id,
      //     target: otherKeywords[0].id,
      //     value: 5,
      //   },
      // ]);
    });
  });

  describe('Create network of type "actor"', () => {
    test('Create event network for type "actor"', async () => {
      const [actor] = fc.sample(ActorArb, 1).map((a) => ({
        ...a,
        memberIn: [],
      }));

      await throwTE(Test.ctx.db.save(ActorEntity, [actor]));

      actorIds.push(actor.id);

      const events = fc.sample(UncategorizedArb, 10).map((e, i) => ({
        ...e,
        draft: false,
        payload: {
          ...e.payload,
          actors: [actor.id],
          groups: [],
          groupsMembers: [],
        },
        media: [],
        links: [],
        date: subDays(new Date(), i),
        createdAt: subDays(new Date(), i),
        keywords: [],
      }));

      await throwTE(Test.ctx.db.save(EventV2Entity, events));

      eventIds.push(...events.map((e) => e.id));

      Test.ctx.logger.debug.log("Message %O");

      const graph = await throwTE(
        createNetworkGraph(Test.ctx)(ACTORS.value, actor.id, {
          groupBy: KEYWORDS.value,
          emptyRelations: fp.O.none,
        })
      );

      expect(graph.events).toMatchObject(events.map((e) => ({ id: e.id })));
      expect(graph.actors).toMatchObject([{ id: actor.id }]);
      expect(graph.graph.nodes).toHaveLength(11);
    });
  });
});
