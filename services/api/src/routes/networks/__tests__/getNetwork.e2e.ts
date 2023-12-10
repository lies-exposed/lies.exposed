import { KEYWORDS } from "@liexp/shared/lib/io/http/Keyword.js";
import { UncategorizedArb } from "@liexp/shared/lib/tests";
import { KeywordArb } from "@liexp/shared/lib/tests/arbitrary/Keyword.arbitrary.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils";
import * as tests from "@liexp/test";
import { addDays } from "date-fns";
import { type AppTest, GetAppTest } from "../../../../test/AppTest";
import { EventV2Entity } from "#entities/Event.v2.entity.js";
import { KeywordEntity } from "#entities/Keyword.entity.js";

describe("Get Network", () => {
  let Test: AppTest, authorizationToken: string, events: any[], keywords: any[];

  beforeAll(async () => {
    Test = await GetAppTest();
    authorizationToken = `Bearer ${Test.ctx.jwt.signUser({
      id: "1",
    } as any)()}`;
  });

  afterEach(async () => {
    await throwTE(
      Test.ctx.db.delete(
        EventV2Entity,
        events.map((e) => e.id),
      ),
    );

    await throwTE(
      Test.ctx.db.delete(
        KeywordEntity,
        keywords.map((e) => e.id),
      ),
    );
  });

  afterAll(async () => {
    await Test.utils.e2eAfterAll();
  });

  test.skip("Should return nodes and links for type 'keyword' ", async () => {
    const [keyword] = tests.fc.sample(KeywordArb, 1);

    await throwTE(Test.ctx.db.save(KeywordEntity, [keyword]));

    keywords = [keyword];

    events = tests.fc.sample(UncategorizedArb, 10).map((e, i) => ({
      ...e,
      draft: false,
      media: [],
      payload: {
        ...e.payload,
        actors: [],
        groups: [],
        groupsMembers: [],
      },
      keywords: i % 2 === 0 ? [keyword] : [],
      links: [],
      date: addDays(new Date(), i),
      createdAt: addDays(new Date(), i),
    }));

    await throwTE(Test.ctx.db.save(EventV2Entity, events));

    const response = await Test.req
      .get(`/v1/networks/${KEYWORDS.value}`)
      .set("Authorization", authorizationToken)
      .query({
        "ids[]": keyword.id,
        groupBy: KEYWORDS.value,
        relation: KEYWORDS.value,
      })
      .expect(200);

    const eventNodes = events
      .filter((e, i) => i % 2 === 0)
      .sort((a, b) => b.date - a.date)
      .map((e) => ({ id: e.id }));

    expect(response.body.data.nodes).toHaveLength(26);
    expect(response.body.data.nodes).toMatchObject([
      { id: keyword.id },
      ...eventNodes,
    ]);

    expect(response.body.data.links.length).toBeGreaterThanOrEqual(15);
  });
});
