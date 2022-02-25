import { fc } from "@liexp/core/tests";
import { PatentEventArb } from "@liexp/shared/tests/arbitrary/events/PatentEvent.arbitrary";
import { AppTest, initAppTest } from "../../../../../test/AppTest";
import { EventV2Entity } from "@entities/Event.v2.entity";

describe("Get Patent List", () => {
  let appTest: AppTest;
  const eventsData = fc.sample(PatentEventArb, 100).map((e) => ({
    ...e,
    draft: false,
    media: [],
    links: [],
    keywords: [],
  }));

  beforeAll(async () => {
    appTest = await initAppTest();

    await appTest.ctx.db.save(EventV2Entity, eventsData as any[])();

  });

  afterAll(async () => {
    await appTest.ctx.db.delete(
      EventV2Entity,
      eventsData.map((e) => e.id)
    )();
  });

  test("Should return the patent list", async () => {
    const response = await appTest.req.get(`/v1/patents`);

    const body = response.body;
    expect(response.status).toEqual(200);
    expect(body.data).toHaveLength(20);
    expect(body.total).toBeGreaterThanOrEqual(100);
  });
});
